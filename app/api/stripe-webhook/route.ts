// File: app/api/stripe-webhook/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import Stripe from "stripe";

export const config = {
  api: {
    // Disable Next.js’s automatic body parser so we can verify Stripe’s raw webhook signature
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

/**
 * Helper that waits for at least one row in `uploads` for a given packId.
 * Retries up to maxAttempts times (default 300 ≈ 10 minutes at 2 s intervals).
 */
async function waitForUploads(
  supabase: any,
  packId: string,
  maxAttempts = 300,
  delayMs = 2000
): Promise<string[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Webhook][Debug] Querying uploads for packId="${packId}" (attempt ${attempt})`);
    const { data: uploads, error } = await supabase
      .from("uploads")
      .select("url")
      .eq("pack_id", packId);

    if (error) {
      console.error(`[Webhook] Supabase error on attempt ${attempt}:`, error);
      break;
    }

    if (uploads && uploads.length > 0) {
      console.log(`[Webhook] Found ${uploads.length} uploaded image(s) on attempt ${attempt}.`);
      // Return an array of URLs (strings)
      return uploads.map((u: any) => u.url as string);
    }

    // Otherwise, wait then retry
    console.log(
      `[Webhook] Attempt ${attempt}: found ${uploads?.length || 0} images. Retrying in ${delayMs / 1000}s…`
    );
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error("No uploaded images found");
}

/**
 * After Stripe checkout completes, this background function will:
 *   1) load the intake (for “name” = gender),
 *   2) wait for the user’s uploaded images,
 *   3) create an Astria tune by sending exactly { name, title, image_urls }.
 *   4) generate prompts via OpenAI and send each prompt to Astria’s /tunes/{tuneId}/prompts.
 *   5) save each prompt_id in Supabase’s generated_images.
 *
 * We do NOT await this in the main POST handler, so Stripe sees 200 immediately.
 */
async function processCheckoutSession(event: Stripe.Event) {
  // Initialize Supabase on the server side
  const supabase = createRouteHandlerClient({ cookies });

  // 1) Extract session + metadata from Stripe
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};
  const userId = metadata.user_id as string | undefined;
  const packId = metadata.packId as string | undefined;
  const packType = metadata.packType as string | undefined; // not strictly needed here, but kept for logging

  console.log("🎯 [Background] Checkout completed metadata:", metadata);

  if (!userId || !packId) {
    console.error("❌ [Background] Missing user_id or packId in metadata");
    return;
  }

  try {
    // 2) Fetch the pack’s "intake" JSON column to read gender (for Astria’s “name”)
    const { data: packRow, error: packErr } = await supabase
      .from("packs")
      .select("intake")
      .eq("id", packId)
      .single();

    if (packErr || !packRow) {
      throw new Error("Could not find pack or intake data");
    }
    const intake = (packRow.intake as Record<string, any>) || {};
    // “name” for Astria must be something like “woman” or “man”
    const gender = (intake.gender as string) || "woman";
    console.log("🧠 [Background] Intake loaded. Gender:", gender);

    // 3) Wait (with retries) for at least 1 uploaded image row in `uploads`
    const imageUrls = await waitForUploads(supabase, packId, 300, 2000);
    console.log("🖼️ [Background] Final list of image URLs:", imageUrls);

    // 4) Create an Astria tune by sending JSON with only { name, title, image_urls }
    //    “title” can be any unique identifier (we’ll use `${userId}-${packId}`).
    const tunePayload = {
      tune: {
        name: gender,                          // required
        title: `${userId}-${packId}`,          // required (UUID-ish)
        image_urls: imageUrls,                 // required
      },
    };

    const tuneRes = await fetch("https://api.astria.ai/tunes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tunePayload),
    });

    // Attempt to parse JSON. If parse fails, read as text so we can log in full.
    let tuneData: any;
    try {
      tuneData = await tuneRes.json();
    } catch {
      const rawText = await tuneRes.text();
      tuneData = { raw: rawText };
    }

    if (!tuneRes.ok) {
      console.error(
        `❌ [Background] Astria /tunes returned HTTP ${tuneRes.status}. Full body:`,
        tuneData
      );
      throw new Error(`Tune creation failed (HTTP ${tuneRes.status})`);
    }

    // Astria should now return an “id” for the newly created tune
    const tuneId = (tuneData as any).id as string | undefined;
    if (!tuneId) {
      console.error("❌ [Background] Astria tune creation returned no ID:", tuneData);
      throw new Error("Tune creation failed (no ID in response)");
    }
    console.log("🧠 [Background] Astria Tune created:", tuneId);

    // 5) Generate prompts via your GPT endpoint
    const promptRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-prompts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      }
    );

    const promptJson = await promptRes.json();
    const prompts = (promptJson.prompts as string[]) || [];
    console.log("📝 [Background] Prompts array is:", prompts);

    if (!Array.isArray(prompts) || prompts.length === 0) {
      console.error("❌ [Background] Prompt generation failed or returned no prompts:", promptJson);
      throw new Error("Prompt generation failed or empty");
    }
    console.log(`📝 [Background] Received ${prompts.length} prompt(s) from GPT.`);

    // 6) For each prompt, send it to Astria’s /tunes/{tuneId}/prompts endpoint
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
          text:             astriaPrompt,
          num_images:       3,
          super_resolution: true,
          inpaint_faces:    true,
           width: 896,
        height: 1152,
        sampler: "euler_a",
        }),
      });

      let promptData: any;
      try {
        promptData = await sendRes.json();
      } catch {
        const rawText = await sendRes.text();
        promptData = { raw: rawText };
      }

      const promptId = (promptData as any)?.id as string | undefined;
      if (!promptId) {
        console.error("❌ [Background] Prompt submission to Astria failed:", promptData);
        continue;
      }

      // 7) Save each Astria prompt ID into Supabase’s generated_images table
      const { error: genErr } = await supabase
        .from("generated_images")
        .insert({
          prompt_id: promptId,
          pack_id:   packId,
          image_url: "", // Astria will fill this later (via webhook or polling)
          url:       `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
          created_at: new Date().toISOString(),
        });

      if (genErr) {
        console.error("❌ [Background] Could not insert into generated_images:", genErr);
      } else {
        console.log("📸 [Background] Saved Astria prompt_id:", promptId);
      }
    }

    console.log("✅ [Background] All prompts sent to Astria successfully.");
  } catch (err: any) {
    console.error("❌ [Background] Webhook error:", err);
  }
}

export async function POST(req: Request) {
  // 1) Read the raw request body & get Stripe's signature header
  const rawBody = await req.text();
  const sig = headers().get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    if (process.env.NODE_ENV === "development") {
      // In dev mode, skip verification and parse JSON directly
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

  // 2) Only respond to checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    console.log("ℹ️ Not a checkout completion event:", event.type);
    return NextResponse.json({ received: true });
  }

  // 3) Kick off the heavy work in the background (do NOT await)
  processCheckoutSession(event).catch((err) => {
    console.error("❌ [Background] Unhandled error:", err);
  });

  // 4) Immediately ack Stripe with HTTP 200 so it stops retrying
  return NextResponse.json({ received: true });
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
