// File: app/api/stripe-webhook/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import Stripe from "stripe";

// ─── Disable automatic body parsing so we can verify the raw payload
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

/**
 * Helper that retries fetching rows from the `uploads` table for a given packId.
 * It will try up to maxAttempts times (default: 10), waiting delayMs milliseconds between attempts.
 * If after all attempts no rows are found, it throws an Error.
 */
async function waitForUploads(
  supabase: any,
  packId: string,
  maxAttempts = 10,
  delayMs = 2000
): Promise<Array<{ url: string }>> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Webhook][Debug] Querying uploads for packId="${packId}" (attempt ${attempt})`);
    const { data: uploads, error } = await supabase
      .from("uploads")
      .select("url")
      .eq("pack_id", packId);

    if (error) {
      console.error(`[Webhook] Supabase query error on attempt ${attempt}:`, error);
      break;
    }

    if (uploads && uploads.length > 0) {
      console.log(`[Webhook] Found ${uploads.length} uploaded image(s) on attempt ${attempt}.`);
      return uploads.map((u: { url: string }) => ({ url: u.url as string }));
    }

    console.log(
      `[Webhook] Attempt ${attempt}: only found ${uploads?.length || 0} images. Retrying in ${
        delayMs / 1000
      }s...`
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("No uploaded images found");
}

/**
 * This function does all of the “heavy work” once a checkout.session.completed arrives:
 * 1) fetch intake → 2) waitForUploads → 3) create Astria Tune → 4) generate prompts → 5) send to Astria → 6) save to generated_images.
 * We deliberately do NOT await it inside the POST handler, so we can respond to Stripe immediately.
 */
async function processCheckoutSession(event: Stripe.Event) {
  // Initialize Supabase client for server‐side
  const supabase = createRouteHandlerClient({ cookies });

  // Extract the session object and metadata
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};
  const userId = metadata.user_id as string | undefined;
  const packId = metadata.packId as string | undefined;
  const packType = metadata.packType as string | undefined;

  console.log("🎯 [Background] Checkout completed metadata:", metadata);

  if (!userId || !packId || !packType) {
    console.error("❌ [Background] Webhook error: missing metadata fields");
    return;
  }

  try {
    // 1. Fetch the `packs` row to get `intake`
    const { data: packRow, error: packErr } = await supabase
      .from("packs")
      .select("intake")
      .eq("id", packId)
      .single();

    if (packErr || !packRow) {
      throw new Error("Could not find pack or intake data");
    }
    const intake = (packRow.intake as Record<string, any>) || {};
    const gender = (intake.gender as string) || "woman";
    console.log("🧠 [Background] Intake loaded. Gender:", gender);

    // 2. Wait (with retry) for at least one upload to appear
    const uploadedRows = await waitForUploads(supabase, packId, /*maxAttempts*/ 300, /*delayMs*/ 2000);
    const imageUrls = uploadedRows.map((r) => r.url);
    console.log("🖼️ [Background] Final list of image URLs:", imageUrls);

    // 3. Create Astria Tune
    const tuneForm = new FormData();
    tuneForm.append("tune[title]", `${userId}-${packId}`);
    tuneForm.append("tune[name]", gender); // “woman” or “man”
    tuneForm.append("tune[branch]", "fast");
    imageUrls.forEach((url) => tuneForm.append("tune[images][]", url));

    const tuneRes = await fetch("https://api.astria.ai/tunes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
      },
      body: tuneForm,
    });

    const tuneData = await tuneRes.json();
    const tuneId = tuneData?.id as string | undefined;
    if (!tuneId) {
      console.error("❌ [Background] Astria tune creation failed:", tuneData);
      throw new Error("Tune creation failed");
    }
    console.log("🧠 [Background] Astria Tune created:", tuneId);

    // 4. Call your own GPT route to generate prompts
    const promptRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-prompts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId }),
    });

    const promptJson = await promptRes.json();
    const prompts = (promptJson.prompts as string[]) || [];
    if (!Array.isArray(prompts)) {
      console.error("❌ [Background] Prompt generation failed:", promptJson);
      throw new Error("Prompt generation failed");
    }
    console.log(`📝 [Background] Received ${prompts.length} prompt(s) from GPT.`);

    // 5. Send each prompt to Astria
    for (const promptText of prompts) {
      const astriaPrompt = `sks ${gender} ${promptText}`;
      console.log("✨ [Background] Sending to Astria:", astriaPrompt);

      const sendRes = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: astriaPrompt,
          num_images: 3,
          super_resolution: true,
          inpaint_faces: true,
        }),
      });

      const promptData = await sendRes.json();
      const promptId = (promptData as any)?.id as string | undefined;
      if (!promptId) {
        console.error("❌ [Background] Prompt submission to Astria failed:", promptData);
        continue;
      }

      // 6. Save to `generated_images`
      const { error: genErr } = await supabase.from("generated_images").insert({
        prompt_id: promptId,
        pack_id: packId,
        image_url: "", // will be updated later by Astria webhook or polling
        url: `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
        created_at: new Date().toISOString(),
      });
      if (genErr) {
        console.error("❌ [Background] Could not insert into generated_images:", genErr);
      } else {
        console.log("📸 [Background] Prompt saved to Supabase (generated_images):", promptId);
      }
    }

    console.log("✅ [Background] All prompts sent to Astria successfully.");
  } catch (err: any) {
    console.error("❌ [Background] Webhook error:", err);
  }
}

export async function POST(req: Request) {
  // 1) Read raw body + stripe-signature
  const rawBody = await req.text();
  const sig = headers().get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    if (process.env.NODE_ENV === "development") {
      // Skip signature verification in dev
      event = JSON.parse(rawBody) as Stripe.Event;
      console.log("🔧 (Dev) Skipped Stripe signature check.");
    } else {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    }
    console.log("✅ Stripe webhook received:", event.type);
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 2) If it’s not a checkout completion, just return 200 immediately
  if (event.type !== "checkout.session.completed") {
    console.log("ℹ️ Not a checkout completion event:", event.type);
    return NextResponse.json({ received: true });
  }

  // 3) Launch the heavy work in the background, but do NOT await it
  processCheckoutSession(event).catch((err) => {
    // Any unexpected top‐level error
    console.error("❌ [Background] Unhandled error:", err);
  });

  // 4) Immediately acknowledge Stripe with a 200
  return NextResponse.json({ received: true });
}

// Optional: block GET requests
export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
