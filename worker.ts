// File: worker.ts
import "dotenv/config";
import Stripe from "stripe";
import redis from "./lib/redisClient";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

// Create Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});


// Helpers: wait for uploads, tune ready, prompt images
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

    if (error) {
      console.error(`[waitForUploads] Supabase error:`, error);
      throw error;
    }
    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`[waitForUploads] Found ${rows.length} uploads`);
      return rows.map((r: any) => r.url as string);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Timeout: No uploads for pack ${packId}`);
}

async function waitForTuneReady(
  tuneId: string,
  maxAttempts = 240,
  delayMs = 5000
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`⌛ [waitForTuneReady] ${attempt}/${maxAttempts}`);
    let res;
    try {
      res = await fetch(`https://api.astria.ai/tunes/${tuneId}`, {
        headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` },
      });
    } catch (err) {
      console.warn(`⚠️ Fetch error:`, err);
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Astria error ${res.status}: ${body}`);
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
    if (!res.ok) {
      throw new Error(`Astria prompt ${promptId} error ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data.images) && data.images.length > 0) {
      return data.images as string[];
    }
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

  // Skip disabled pack
  if (packType === "multi-purpose") {
    console.log("⛔ Skipped multi-purpose");
    return;
  }

  // 1) Wait for uploads
  const imageUrls = await waitForUploads(supabase, packId);
  console.log("🖼️ Upload URLs:", imageUrls);

  // 2) Get or create tune
  const { data: packRow, error: packErr } = await supabase
    .from("packs")
    .select("tune_id")
    .eq("id", packId)
    .single();
  if (packErr) throw packErr;
  let tuneId = packRow?.tune_id;
  if (!tuneId) {
    const tuneRes = await fetch("https://api.astria.ai/tunes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
      },
      body: JSON.stringify({ tune: { image_urls: imageUrls, /*...*/ } }),
    });
    if (!tuneRes.ok) throw new Error("Tune creation failed");
    const tuneData = await tuneRes.json();
    tuneId = tuneData.id;
    await supabase.from("packs").update({ tune_id: tuneId }).eq("id", packId);
  }

  // 3) Wait for tune ready
  await waitForTuneReady(tuneId);

  // 4) Get GPT prompts
  const promptRes = await fetch(
    `${process.env.SITE_URL}/api/generate-prompts`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, packId, packType }) }
  );
  if (!promptRes.ok) throw new Error("Prompt fetch failed");
  const { prompts } = await promptRes.json();

  // 5) For each prompt, submit to Astria and insert images with retries
  for (const promptText of prompts) {
    const astriaPrompt = `sks ${gender} ${promptText}`;
    const sendRes = await fetch(
      `https://api.astria.ai/tunes/${tuneId}/prompts`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: astriaPrompt, num_images: 3, super_resolution: true, inpaint_faces: true, width: 896, height: 1152, sampler: "euler_a" }),
      }
    );
    const { id: promptId } = await sendRes.json();
    if (!promptId) continue;
    // STEP 2A: Retry image polling
    let images: string[] = [];
    for (let i = 1; i <= 3; i++) {
      images = await waitForPromptImages(tuneId, promptId);
      if (images.length === 3) break;
      await new Promise((r) => setTimeout(r, 3000));
    }
    console.log(`Images for ${promptId}:`, images.length);

    // STEP 2B: Retry Supabase inserts
    const insertData = images.map((url) => ({ prompt_id: promptId, pack_id: packId, image_url: url, url: `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`, created_at: new Date().toISOString() }));
    let inserted = false;
    for (let i = 1; i <= 3; i++) {
      const { error } = await supabase.from("generated_images").insert(insertData);
      if (!error) { inserted = true; break; }
      await new Promise((r) => setTimeout(r, 2000));
    }
    if (!inserted) console.error(`Failed to insert images for prompt ${promptId}`);
  }
// ─────────────────────────────────────────────────────────────────────────────
  // Step 5A: Look up the user’s email from the users table
  // ─────────────────────────────────────────────────────────────────────────────
  let userEmail = "";
  let firstName = "";
  let lastName = "";

  try {
    const { data: usr, error: usrErr } = await supabase
      .from("users")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .single();
    if (usrErr || !usr) throw usrErr ?? new Error("User not found");
    userEmail = usr.email;
    firstName = usr.first_name;
    lastName  = usr.last_name;
  } catch (err) {
    console.error("❌ Could not load user email:", err);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 5B: Trigger the GHL “Photos Ready” webhook unconditionally
  // ─────────────────────────────────────────────────────────────────────────────
  const webhookUrl = process.env.GHL_INBOUND_WEBHOOK_URL!;
  if (userEmail) {
    // Re-fetch all final URLs to include in the payload
    const { data: allRows } = await supabase
      .from("generated_images")
      .select("image_url")
      .eq("pack_id", packId);

    const galleryUrls = (allRows || []).map((r) => r.image_url);

    console.log(`📣 Firing GHL webhook with ${galleryUrls.length} URLs`);
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:       userEmail,
        firstName,
        lastName,
        packId,
        galleryUrls,
      }),
    })
      .then((res) => console.log(`✅ GHL webhook status ${res.status}`))
      .catch((err) => console.error("❌ GHL webhook error:", err));
  } else {
    console.warn("⚠️ No userEmail — skipping GHL webhook");
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 5C: Schedule a 20‐minute fallback in case images < 45
  // ─────────────────────────────────────────────────────────────────────────────
  setTimeout(async () => {
    // re-check count
    const { data: rowsAfter20, error: err20 } = await supabase
      .from("generated_images")
      .select("image_url")
      .eq("pack_id", packId);

    const count = (rowsAfter20 || []).length;
    if (count < 45 && userEmail) {
      console.log(`⚠️ Fallback: only ${count}/45 images. Sending GHL fallback email.`);
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:       userEmail,
          firstName,
          lastName,
          packId,
          galleryUrls: rowsAfter20?.map((r) => r.image_url) || [],
          note:        `Only ${count}/45 images completed after 20 minutes.`,
        }),
      })
        .then((res) => console.log(`✅ Fallback webhook status ${res.status}`))
        .catch((err) => console.error("❌ Fallback webhook error:", err));
    }
  }, 20 * 60 * 1000); // 20 minutes
}


// ──────────────────────────────────────────────────────────────────────────────
// Run the worker loop
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Worker started");
  while (true) {
    const jobJson = await redis.rpop("jobQueue");
    if (jobJson) {
      await processJob(JSON.parse(jobJson));
    } else {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

main();
