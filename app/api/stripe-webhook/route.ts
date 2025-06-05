// File: app/api/create-astria-job/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * Wait until Supabase has at least one `uploads` row for this packId.
 * Retries up to maxAttempts with delayMs between attempts.
 */
async function waitForUploads(
  supabase: any,
  packId: string,
  maxAttempts = 10,
  delayMs = 1500
): Promise<string[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(
      `[create-astria-job] Checking uploads for packId="${packId}" (attempt ${attempt})`
    );
    const { data: rows, error } = await supabase
      .from("uploads")
      .select("url")
      .eq("pack_id", packId);

    if (error) throw error;
    if (rows && rows.length > 0) {
      return rows.map((r: any) => r.url as string);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("No uploaded images found for pack " + packId);
}

/**
 * Poll an Astria prompt endpoint until it returns at least one generated image.
 * Once images appear, return that array of URLs.
 */
async function waitForPromptImages(
  tuneId: string,
  promptId: string,
  pollInterval = 3000,
  maxPolls = 20
): Promise<string[]> {
  for (let i = 0; i < maxPolls; i++) {
    const res = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    let json: any;
    try {
      json = await res.json();
    } catch {
      const text = await res.text();
      console.warn(
        `[waitForPromptImages] Unable to parse JSON for prompt ${promptId}:`,
        text
      );
      json = {};
    }

    // Astria’s response will include an `images` array once ready:
    //   { id: 123, status: "ready", images: ["https://cdn.astria.ai/…jpg", …] }
    if (Array.isArray(json.images) && json.images.length > 0) {
      return json.images;
    }

    console.log(
      `[waitForPromptImages] Prompt ${promptId} status="${
        json.status || "unknown"
      }". Retrying in ${pollInterval / 1000}s…`
    );
    await new Promise((r) => setTimeout(r, pollInterval));
  }
  throw new Error(`Prompt ${promptId} never returned images after polling.`);
}

/**
 * Wait until the Astria Tune is ready.
 * Polls the Astria API for the tune status until it is "ready" or times out.
 */
async function waitForTuneReady(tuneId: string): Promise<void> {
  const MAX_WAIT_MINUTES = 60;
  const RETRY_INTERVAL_MS = 5000;
  const MAX_ATTEMPTS = (MAX_WAIT_MINUTES * 60 * 1000) / RETRY_INTERVAL_MS;

  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    try {
      const res = await fetch(`https://api.astria.ai/tunes/${tuneId}`, {
        headers: {
          Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = res.headers.get("content-type");
      let data: any;

      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        const raw = await res.text();
        console.error(`[waitForTuneReady] ❌ Astria returned non-JSON:`, raw);
        throw new Error("Non-JSON response from Astria");
      }
console.log(`[waitForTuneReady] 🔍 Raw Astria response for tune ${tuneId}:`, data);

console.log(`[waitForTuneReady] 🔍 Raw Astria response for tune ${tuneId}:`, data);

if (data?.trained_at) {
  console.log(`[waitForTuneReady] ✅ Tune ${tuneId} is trained and ready.`);
  return;
}

console.log(`[waitForTuneReady] Tune ${tuneId} not ready yet. Retrying in 5s…`);


if (status === "failed") {
  throw new Error(`[waitForTuneReady] ❌ Tune ${tuneId} failed according to Astria.`);
}


      if (status === "failed") {
        console.error(`[waitForTuneReady] ❌ Tune ${tuneId} failed.`);
        throw new Error("Tune failed.");
      }
    } catch (err) {
      console.error(`[waitForTuneReady] ❌ Error checking tune status:`, err);
    }

    attempt++;
    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
  }

  throw new Error(`[waitForTuneReady] ❌ Timeout: Tune ${tuneId} not ready after ${MAX_WAIT_MINUTES} minutes.`);
}


/**
 * After a Stripe checkout.session.completed, do:
 *   1) fetch intake → 2) waitForUploads → 3) create Astria Tune (LoRa/Flux settings)
 *   4) waitForTuneReady → 5) generate prompts via GPT → 6) send all prompts to Astria
 *   7) poll each prompt until images appear → 8) save actual image URL into “generated_images”.
 */
async function processCheckoutSession(event: any) {
  // 1) Initialize Supabase on the server side
  const supabase = createRouteHandlerClient({ cookies });

  // 2) Extract Stripe session + metadata
  const session = event.data.object as any; // Stripe.Checkout.Session
  const metadata = session.metadata || {};
  const userId = metadata.user_id as string | undefined;
  const packId = metadata.packId as string | undefined;

  console.log("🎯 [Background] Checkout completed metadata:", metadata);
  if (!userId || !packId) {
    console.error("❌ [Background] Missing user_id or packId in metadata");
    return;
  }

  try {
    // 3) Fetch “packs” row to get intake JSON (to read gender)
    const { data: packRow, error: packErr } = await supabase
      .from("packs")
      .select("intake")
      .eq("id", packId)
      .single();

    if (packErr || !packRow) {
      throw new Error("Could not find pack or intake data");
    }
    const intake = (packRow.intake as Record<string, any>) || {};
    // Astria “name” must be exactly “woman” or “man”
    const gender = (intake.gender as string) || "woman";
    console.log("🧠 [Background] Intake loaded. Gender:", gender);

    // 4) Wait until Supabase has at least one upload row for this packId
    const imageUrls = await waitForUploads(
      supabase,
      packId,
      /*maxAttempts*/ 300,
      /*delayMs*/ 2000
    );
    console.log("🖼️ [Background] Final list of image URLs:", imageUrls);

    // ───────▶ STEP A: CREATE ASTRIA TUNE (LoRa / Flux settings) ───────
    // We send exactly { name, title, base_tune_id, model_type, branch, preset, face_detection, image_urls }
    const tunePayload = {
      tune: {
        name: gender,                            // “woman” or “man”
        title: `${userId}-${packId}`,            // unique-ish string
        base_tune: "flux.1 dev",              // ⚠️ Flux: “flux.1 dev”
        model_type: "lora",                      // ⚠️ LoRa model
        branch: "flux1",                         // ⚠️ branch name
        preset: "flux-lora-portrait",            // ⚠️ preset
        face_detection: true,                    // ⚠️ face detection on
        image_urls: imageUrls,                   // array of user uploads
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

    let tuneData: any;
    try {
      tuneData = await tuneRes.json();
    } catch {
      const raw = await tuneRes.text();
      tuneData = { raw };
    }
    if (!tuneRes.ok) {
      console.error(
        `❌ Astria /tunes returned HTTP ${tuneRes.status}. Full body:`,
        tuneData
      );
      throw new Error(`Tune creation failed (HTTP ${tuneRes.status})`);
    }

    const tuneId = (tuneData as any)?.id as string | undefined;
    if (!tuneId) {
      console.error("❌ Astria tune creation returned no ID:", tuneData);
      throw new Error("Tune creation returned no ID");
    }
    console.log("[create-astria-job] Astria Tune created with ID:", tuneId);

    // ───────▶ STEP B: WAIT FOR THE TUNE TO BE “ready” ◀──────
    await waitForTuneReady(tuneId);

    // ───────▶ STEP C: GENERATE GPT PROMPTS via your /api/generate-prompts ○◐ ───────
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
      console.error(
        "❌ [Background] Prompt generation failed or returned no prompts:",
        promptJson
      );
      throw new Error("Prompt generation failed or empty");
    }
    console.log(`📝 [Background] Received ${prompts.length} prompt(s) from GPT.`);

    // ───────▶ STEP D: FOR EACH PROMPT → POST TO Astria /tunes/{tuneId}/prompts ◀──────
    for (const promptText of prompts) {
      const astriaPrompt = `sks ${gender} ${promptText}`;
      console.log("✨ [Background] Sending to Astria (prompt):", astriaPrompt);

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
          width:            896,
          height:           1152,
          sampler:          "euler_a",
        }),
      });

      let promptData: any;
      try {
        promptData = await sendRes.json();
      } catch {
        const raw = await sendRes.text();
        promptData = { raw };
      }

      if (!sendRes.ok) {
        console.error(
          `❌ Astria /tunes/${tuneId}/prompts returned HTTP ${sendRes.status}. Full body:`,
          promptData
        );
        continue; // skip to next prompt
      }

      const promptId = (promptData as any)?.id as string | undefined;
      if (!promptId) {
        console.error("❌ Astria prompt creation returned no ID:", promptData);
        continue;
      }
      console.log(
        `[create-astria-job] Astria prompt created with ID: ${promptId}`
      );

      // ───────▶ STEP E: INSERT a placeholder row into Supabase.generated_images ◀──────
      // We fill `image_url` later once the prompt’s images are ready.
      const { error: genErr } = await supabase.from("generated_images").insert({
        prompt_id: promptId,
        pack_id:   packId,
        image_url: "", // placeholder
        url:       `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
        created_at: new Date().toISOString(),
      });
      if (genErr) {
        console.error(
          "❌ Supabase insert into generated_images failed:",
          genErr
        );
        // Even if that fails, we still attempt to poll Astria
      } else {
        console.log(
          `[create-astria-job] Saved placeholder for Astria promptId ${promptId}`
        );
      }

      // ───────▶ STEP F: POLL until that prompt’s images array appears ◀──────
      try {
        const images = await waitForPromptImages(tuneId, promptId, 3000, 20);
        // Once images appear, pick the first (or however many you like)
        const firstUrl = images[0];
        console.log(
          `[create-astria-job] Prompt ${promptId} returned images:`,
          images
        );

        // ───────▶ STEP G: UPDATE Supabase.generated_images.image_url with the first image URL ◀──────
        const { error: updateErr } = await supabase
          .from("generated_images")
          .update({ image_url: firstUrl })
          .eq("prompt_id", promptId);
        if (updateErr) {
          console.error(
            `❌ Supabase update generated_images for prompt ${promptId} failed:`,
            updateErr
          );
        } else {
          console.log(
            `[create-astria-job] Updated generated_images.image_url for prompt ${promptId}`
          );
        }
      } catch (pollErr) {
        console.error(
          `❌ Polling images for prompt ${promptId} failed:`,
          pollErr
        );
      }
    }

    console.log("✅ [Background] All prompts sent and images saved.");
  } catch (err: any) {
    console.error("❌ [Background] Webhook error:", err);
  }
}

/**
 * The main Stripe Webhook POST handler. We do NOT await processCheckoutSession,
 * so we immediately reply “200” to Stripe. The heavy work happens in the background.
 */
export async function POST(req: Request) {
  // 1) Read raw body + stripe-signature
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: any;
  try {
    if (process.env.NODE_ENV === "development") {
      // Skip signature verification in dev
      event = JSON.parse(rawBody);
      console.log("🔧 (Dev) Skipped Stripe signature check.");
    } else {
      event = new (await import("stripe")).Stripe(
        process.env.STRIPE_SECRET_KEY!,
        { apiVersion: "2025-05-28.basil" }
      ).webhooks.constructEvent(
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

  // 2) If it’s not a checkout completion, immediately respond 200
  if (event.type !== "checkout.session.completed") {
    console.log("ℹ️ Not a checkout completion event:", event.type);
    return NextResponse.json({ received: true });
  }

  // 3) Launch the heavy work in the background (do NOT await)
  processCheckoutSession(event).catch((err) => {
    console.error("❌ [Background] Unhandled error:", err);
  });

  // 4) Acknowledge Stripe with HTTP 200 right away
  return NextResponse.json({ received: true });
}

// Optional: block GET requests on this route
export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
