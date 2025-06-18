// File: worker.ts
import "dotenv/config";
import Stripe from "stripe";
import redis from "./lib/redisClient";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

// Initialize Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// ──────────────────────────────────────────────────────────────────────────────
// Helpers: wait for uploads, tune readiness, prompt images
// ──────────────────────────────────────────────────────────────────────────────
async function waitForUploads(
  supabase: any,
  packId: string,
  maxAttempts = 300,
  delayMs = 2000
): Promise<string[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[waitForUploads] Attempt ${attempt}/${maxAttempts}`);
    const { data: rows, error } = await supabase
      .from("uploads")
      .select("url")
      .eq("pack_id", packId);
    if (error) throw error;
    if (rows && rows.length > 0) return rows.map((r: any) => r.url);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Timeout: No uploads for pack ${packId}`);
}

async function waitForTuneReady(
  tuneId: string,
  maxAttempts = 240,
  delayMs = 5000
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`⌛ [waitForTuneReady] ${attempt}/${maxAttempts}`);
    const res = await fetch(`https://api.astria.ai/tunes/${tuneId}`, {
      headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` },
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ waitForTuneReady error ${res.status}:`, errText);
      throw new Error(`Astria tune status error ${res.status}`);
    }
    const data = await res.json();
    if (data.status === "ready" || data.trained_at) {
      console.log("✅ Tune ready");
      return;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Timeout: Tune ${tuneId} not ready`);
}

async function waitForPromptImages(
  tuneId: string,
  promptId: string,
  maxAttempts = 60,
  delayMs = 3000
): Promise<string[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`⌛ [waitForPromptImages] ${attempt}/${maxAttempts}`);
    const res = await fetch(
      `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
      { headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` } }
    );
    if (!res.ok) throw new Error(`Astria prompt ${promptId} error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data.images) && data.images.length > 0) return data.images;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Timeout: Images for prompt ${promptId} not ready`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Main job processing
// ──────────────────────────────────────────────────────────────────────────────
async function processJob(job: any) {
  console.log("🎯 Processing job:", job);
  const { userId, packId, gender, packType, sessionId } = job;
  if (packType === "multi-purpose") return;

  // 1) Wait for user uploads
  const imageUrls = await waitForUploads(supabase, packId);
  console.log("🖼️ Upload URLs:", imageUrls);

  // 2) Get or create Astria tune
  const { data: packRow, error: packErr } = await supabase
    .from("packs")
    .select("tune_id")
    .eq("id", packId)
    .single();
  if (packErr) throw packErr;

  let tuneId = packRow?.tune_id;
  if (!tuneId) {
    const sanitizedName = `Pack${packId.replace(/[^a-zA-Z0-9 ]/g, "")}`;
    console.log(`Creating tune with name: ${sanitizedName}`);

    const tuneRes = await fetch("https://api.astria.ai/tunes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
      },
      body: JSON.stringify({
        tune: {
          name: sanitizedName,
          title: `PackTune-${packId}`,
          branch: "flux1",
          image_urls: imageUrls,
          token: "sks",
          steps: 300,
          class_name: "woman",
          model_type: "lora",
          face_detection: true,
          api: true,
          preset: "flux-lora-portrait",
          base_tune: "Flux.1 dev"
        }
      }),
    });

    if (!tuneRes.ok) {
      const errStatus = tuneRes.status;
      const errBody = await tuneRes.text();
      console.error(`❌ Astria Tune creation error ${errStatus}:`, errBody);
      throw new Error(`Astria Tune failed ${errStatus}: ${errBody}`);
    }

    const tuneData = await tuneRes.json();
    tuneId = tuneData.id;
    await supabase.from("packs").update({ tune_id: tuneId }).eq("id", packId);
    console.log(`✅ Tune created with ID: ${tuneId}`);
  }

  // 3) Wait until tune is ready
  await waitForTuneReady(tuneId);

  // 4) Generate GPT prompts
  const promptRes = await fetch(`${process.env.SITE_URL}/api/generate-prompts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, packId, packType }),
  });
  if (!promptRes.ok) throw new Error("Prompt fetch failed");
  const { prompts } = await promptRes.json();

  // 5) For each prompt, send to Astria and save images
  for (const promptText of prompts) {
    const astriaPrompt = `sks ${gender} ${promptText}`;
    console.log(`Submitting prompt: ${astriaPrompt}`);

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

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      console.error(`❌ Failed to submit prompt: ${sendRes.status} ${errText}`);
      continue;
    }

    const { id: promptId } = await sendRes.json();
    if (!promptId) continue;

    // Poll for prompt images
    let images: string[] = [];
    for (let i = 1; i <= 10; i++) {
      images = await waitForPromptImages(tuneId, promptId);
      if (images.length === 3) break;
      console.log(`⌛ Polling images for ${promptId} (${i}/10)`);
      await new Promise((r) => setTimeout(r, 3000));
    }
    if (images.length !== 3) console.warn(`⚠️ Received ${images.length}/3 images for ${promptId}`);

    // Insert into Supabase
    const insertData = images.map((url) => ({
      prompt_id: promptId,
      pack_id: packId,
      image_url: url,
      url: `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
      created_at: new Date().toISOString(),
    }));
    await supabase.from("generated_images").insert(insertData);
  }

  // 6) Gather user email for webhook
  let userEmail = "";
  let firstName = "";
  let lastName = "";

  try {
    const { data: usr, error: usrErr } = await supabase
      .from("users")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .single();

    if (usrErr || !usr) {
      console.warn("⚠️ User not in Supabase; retrieving email from Stripe session");
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      userEmail = session.customer_details?.email ?? "";
    } else {
      userEmail = usr.email;
      firstName = usr.first_name;
      lastName = usr.last_name;
    }
  } catch (err) {
    console.error("❌ Error loading user info:", err);
  }

  // 7) Fire GHL webhook
  if (userEmail) {
    const { data: allRows } = await supabase
      .from("generated_images")
      .select("image_url")
      .eq("pack_id", packId);
    const galleryUrls = (allRows || []).map((r) => r.image_url);
    await fetch(process.env.GHL_INBOUND_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, firstName, lastName, packId, galleryUrls }),
    });
    console.log(`📣 GHL webhook sent to ${userEmail}`);
  }

  // 8) Fallback after 20 minutes
  setTimeout(async () => {
    const { data: rowsAfter20 } = await supabase
      .from("generated_images")
      .select("image_url")
      .eq("pack_id", packId);
    const count = (rowsAfter20 || []).length;
    if (count < 45 && userEmail) {
      await fetch(process.env.GHL_INBOUND_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          firstName,
          lastName,
          packId,
          galleryUrls: (rowsAfter20 ?? []).map((r) => r.image_url),
          note: `Only ${count}/45 images after 20 minutes`,
        }),
      });
            console.log(`⚠️ Fallback GHL webhook sent`);
          }
        }, 20 * 60 * 1000); // 20 minutes
      }
