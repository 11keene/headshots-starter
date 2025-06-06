// ──────────────────────────────────────────────────────────────────────────────
// File: app/api/stripe-webhook/route.ts
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import Stripe from "stripe";

// ──────────────────────────────────────────────────────────────────────────────
// Initialize the Stripe client
// ──────────────────────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

/**
 * Helper: Poll Supabase `uploads` table until at least one URL appears for this packId.
 * Retries up to maxAttempts (default 300 ≈ 10 min at 2 s intervals). Returns URLs.
 */
async function waitForUploads(
  supabase: any,
  packId: string,
  maxAttempts = 300,
  delayMs = 2000
): Promise<string[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(
      `[waitForUploads] Checking uploads for packId="${packId}" (attempt ${attempt}/${maxAttempts})`
    );
    const { data: rows, error } = await supabase
      .from("uploads")
      .select("url")
      .eq("pack_id", packId);

    if (error) {
      console.error(`[waitForUploads] Supabase error:`, error);
      throw error;
    }

    if (Array.isArray(rows) && rows.length > 0) {
      console.log(
        `[waitForUploads] Found ${rows.length} upload(s) for packId="${packId}".`
      );
      return rows.map((r: any) => r.url as string);
    }

    console.log(
      `[waitForUploads] No uploads yet (found ${rows.length}). Retrying in ${delayMs / 1000}s…`
    );
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error(
    `No uploaded images found for pack ${packId} after ${maxAttempts} attempts`
  );
}

/**
 * Helper: Poll Astria’s Tune endpoint until “ready” (or has a `trained_at` timestamp).
 * Retries up to maxAttempts (default 240 ≈ 20 min at 5 s intervals).
 */
async function waitForTuneReady(
  tuneId: string,
  maxAttempts = 240, // 240×5 s = 1200 s = 20 min
  delayMs = 5000
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(
      `⌛ [waitForTuneReady] Attempt ${attempt}/${maxAttempts} for tuneId="${tuneId}"`
    );

    let res;
    try {
      res = await fetch(`https://api.astria.ai/tunes/${tuneId}`, {
        headers: {
          Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        },
      });
    } catch (err) {
      console.warn(
        `⚠️ [waitForTuneReady] Fetch attempt ${attempt} threw an error:`,
        err
      );
      if (attempt === maxAttempts) throw err;
      console.log(`🔄 [waitForTuneReady] Retrying in ${delayMs / 1000}s…`);
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }

    if (!res.ok) {
      const raw = await res.text();
      console.error(
        `❌ [waitForTuneReady] Astria HTTP ${res.status} for tune ${tuneId}, body:`,
        raw
      );
      throw new Error(`Astria returned HTTP ${res.status} for tune ${tuneId}`);
    }

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      console.warn(
        `⚠️ [waitForTuneReady] Couldn’t parse JSON (attempt ${attempt}), raw:`,
        await res.text()
      );
    }

    if (data?.status === "ready" || data?.trained_at) {
      console.log(`✅ [waitForTuneReady] Tune ${tuneId} is ready.`);
      return;
    }

    console.log(
      `🔄 [waitForTuneReady] Tune ${tuneId} status="${
        data.status || "unknown"
      }" (attempt ${attempt}). Retrying in ${delayMs / 1000}s…`
    );
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error(
    `🔴 [waitForTuneReady] Timeout: Tune ${tuneId} not ready after ${maxAttempts} attempts`
  );
}

/**
 * Helper: Poll Astria’s Prompt endpoint until it returns an array of image URLs.
 * Retries up to maxAttempts (default 60 ≈ 3 min at 3 s intervals).
 */
async function waitForPromptImages(
  tuneId: string,
  promptId: string,
  maxAttempts = 60, // 60×3 s = 180 s = 3 min
  delayMs = 3000
): Promise<string[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(
      `⌛ [waitForPromptImages] Attempt ${attempt}/${maxAttempts} for promptId="${promptId}"`
    );
    const res = await fetch(
      `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error(
        `❌ [waitForPromptImages] Astria HTTP ${res.status} for prompt ${promptId}`
      );
      throw new Error(`Astria returned HTTP ${res.status} for prompt ${promptId}`);
    }

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      console.warn(
        `⚠️ [waitForPromptImages] Couldn’t parse JSON (attempt ${attempt}), raw:`,
        await res.text()
      );
      data = {};
    }

    if (Array.isArray(data.images) && data.images.length > 0) {
      console.log(
        `✅ [waitForPromptImages] Prompt ${promptId} returned ${data.images.length} image(s).`
      );
      return data.images as string[];
    }

    console.log(
      `🔄 [waitForPromptImages] Prompt ${promptId} status="${
        data.status || "unknown"
      }" (attempt ${attempt}). Retrying in ${delayMs / 1000}s…`
    );
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error(
    `🔴 [waitForPromptImages] Timeout: Prompt ${promptId} never returned images after ${maxAttempts} attempts`
  );
}

/**
 * Main background process that runs when Stripe fires “checkout.session.completed.”
 * Steps:
 *   1) Wait for user uploads
 *   2) Call your /api/astria/create-tune to create an Astria Tune
 *   3) Wait for that Tune to be “ready”
 *   4) Generate GPT prompts
 *   5) For each prompt: send to Astria, wait for images, bulk-insert
 */
async function processCheckoutSession(event: Stripe.Event) {
  const supabase = createRouteHandlerClient({
    cookies: () => cookies(),
  });

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};
  const userId = metadata.user_id as string | undefined;
  const packId = metadata.packId as string | undefined;
  const gender = metadata.gender as string | undefined; // e.g. "woman"
  const packType = metadata.packType as string | undefined; // e.g. "headshots"

  console.log("🎯 [Background] Checkout completed metadata:", metadata);
  if (!userId || !packId || !gender) {
    console.error("❌ [Background] Missing metadata. Aborting.");
    throw new Error("Missing user_id, packId, or gender in metadata");
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) Wait for the user’s uploaded images to show up in Supabase “uploads” table
  // ─────────────────────────────────────────────────────────────────────────────
  const imageUrls = await waitForUploads(supabase, packId, 300, 2000);
  console.log("🖼️ [Background] Final list of image URLs:", imageUrls);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) CALL YOUR create-tune ROUTE instead of posting to Astria directly
  //    (app/api/astria/create-tune/route.ts)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("🧩 [Background] Delegating to /api/astria/create-tune …");
  try {
    const ctResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/astria/create-tune`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          // pass along the raw packId (which already includes your “-man” or “-woman” suffix):
          packId,
          // optionally you could also send imageUrls here if your create-tune endpoint expects them:
          imageUrls,
        }),
      }
    );

    console.log(
      `🧩 [Background] create-tune responded with status ${ctResponse.status}`
    );

    let ctJson: any = {};
    try {
      ctJson = await ctResponse.json();
    } catch (err) {
      console.warn(
        "⚠️ [Background] Failed to parse create-tune JSON:",
        err
      );
    }
    console.log("🧩 [Background] create-tune JSON:", ctJson);

    if (!ctResponse.ok || !ctJson.tuneId) {
      console.error(
        "❌ [Background] create-tune failed or returned no tuneId:",
        ctJson
      );
      throw new Error(`create-tune failure: ${ctResponse.status}`);
    }

    const tuneId = ctJson.tuneId as string;
    console.log(`✅ [Background] Received tuneId="${tuneId}" from create-tune`);

    // ─────────────────────────────────────────────────────────────────────────────
    // 3) Wait for that tune to be “ready” on Astria (up to 20 minutes)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log(
      `⏳ [Background] Waiting up to 20 minutes for Astria Tune ${tuneId} to be ready…`
    );
    await waitForTuneReady(tuneId, 240, 5000);

    // ─────────────────────────────────────────────────────────────────────────────
    // 4) Fetch GPT-generated prompts
    // ─────────────────────────────────────────────────────────────────────────────
    console.log(`📩 [Background] Requesting GPT prompts for packId="${packId}"`);
    const promptRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-prompts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId, gender, packType, userId }),
      }
    );

    let promptJson: any = {};
    try {
      promptJson = await promptRes.json();
    } catch {
      promptJson = { raw: await promptRes.text() };
    }

    const prompts = (promptJson.prompts as string[]) || [];
    if (!Array.isArray(prompts) || prompts.length === 0) {
      console.error(
        "❌ [Background] Prompt generation failed or returned no prompts:",
        promptJson
      );
      throw new Error("Prompt generation failed or returned no prompts");
    }
    console.log(`📝 [Background] Received ${prompts.length} prompt(s) from GPT.`);

    // ─────────────────────────────────────────────────────────────────────────────
    // 5) For each prompt, send to Astria and then bulk-insert results into Supabase
    // ─────────────────────────────────────────────────────────────────────────────
    for (const promptText of prompts) {
      const astriaPrompt = `sks ${gender} ${promptText}`;
      console.log("✨ [Background] Sending to Astria (prompt):", astriaPrompt);

      // 5a) POST new prompt to Astria (requests 3 images)
      const sendRes = await fetch(
        `https://api.astria.ai/tunes/${tuneId}/prompts`,
        {
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
            width: 896,
            height: 1152,
            sampler: "euler_a",
          }),
        }
      );

      let promptData: any = {};
      try {
        promptData = await sendRes.json();
      } catch {
        promptData = { raw: await sendRes.text() };
        console.warn(
          `⚠️ [Background] Couldn’t parse Astria prompt JSON for "${promptText}", raw:`,
          promptData.raw
        );
      }

      if (!sendRes.ok) {
        console.error(
          `❌ [Background] Astria /tunes/${tuneId}/prompts returned HTTP ${sendRes.status}:`,
          promptData
        );
        continue; // skip this prompt if Astria returns an error
      }

      const promptId = (promptData as any)?.id as string | undefined;
      if (!promptId) {
        console.error(
          "❌ [Background] Astria prompt creation returned no ID:",
          promptData
        );
        continue;
      }
      console.log(`[create-astria-job] Astria prompt created with ID: ${promptId}`);

      // 5b) Poll Astria until it returns at least one image URL (up to 3 minutes)
      let images: string[] = [];
      try {
        console.log(
          `⏳ [Background] Waiting up to 3 minutes for prompt ${promptId} images…`
        );
        images = await waitForPromptImages(tuneId, promptId, 60, 3000);
        console.log(
          `[Background] Prompt ${promptId} returned ${images.length} image(s).`
        );
      } catch (err) {
        console.error(
          `❌ [Background] Polling images for prompt ${promptId} failed:`,
          err
        );
        continue;
      }

      // 5c) Bulk-insert each returned URL into Supabase.generated_images
      const insertData = images.map((url) => ({
        prompt_id: promptId,
        pack_id: packId,
        image_url: url.trim(),
        url: `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
        created_at: new Date().toISOString(),
      }));
      console.log(
        `[Background] Inserting ${insertData.length} images for prompt ${promptId}...`
      );
      const { error: bulkInsertErr } = await supabase
        .from("generated_images")
        .insert(insertData);

      if (bulkInsertErr) {
        console.error(
          `❌ [Background] Failed to insert images for prompt ${promptId}:`,
          bulkInsertErr
        );
      } else {
        console.log(
          `✅ [Background] Inserted ${insertData.length} images for prompt ${promptId}`
        );
      }
    }

    console.log("✅ [Background] All prompts sent and images saved.");
  } catch (err) {
    // Any error arriving from create-tune or subsequent steps will land here
    console.error("❌ [Background] Unhandled error in processCheckoutSession:", err);
  }
}

/**
 * Main Next.js webhook handler (POST).
 * 1) Verify Stripe signature
 * 2) Only handle checkout.session.completed
 * 3) Kick off processCheckoutSession(event) in the background
 * 4) Return 200 OK immediately so Stripe stops retrying
 */
export async function POST(req: Request) {
  // 1) Read raw body
  const rawBody = await req.text();
  // 2) Grab the Stripe signature header from the incoming request
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    // Always do real signature verification in production
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ [Stripe Webhook] Signature verified. Event:", event.type);
  } catch (err: any) {
    console.error("❌ [Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3) Only handle checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    console.log("ℹ️ [Stripe Webhook] Ignoring event type:", event.type);
    return NextResponse.json({ received: true });
  }

  // 4) Kick off the background process (which now delegates to create-tune, etc.)
  console.log("▶️ [Stripe Webhook] Handling checkout.session.completed");
  processCheckoutSession(event).catch((err) => {
    console.error("❌ [Background] Unhandled error:", err);
  });

  // 5) Immediately return 200 OK so Stripe stops retrying
  return NextResponse.json({ received: true });
}

// Explicitly reject GET requests; only POST is allowed
export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
