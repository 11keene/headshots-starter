// File: worker.ts
import "dotenv/config";
import Stripe from "stripe";
import redis from "./lib/redisClient";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

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

async function waitForTuneReady(tuneId: string, maxAttempts = 240, delayMs = 5000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(`https://api.astria.ai/tunes/${tuneId}`, {
      headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` },
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    if (data.status === "ready" || data.trained_at) return;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(`Timeout: Tune ${tuneId} not ready`);
}

async function waitForPromptImages(tuneId: string, promptId: string, maxAttempts = 60, delayMs = 3000): Promise<string[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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

async function processJob(job: any) {
  console.log("🎯 Processing job:", job);
  const { userId, packId, gender, packType, sessionId } = job;
  if (packType === "multi-purpose") return;

  const imageUrls = await waitForUploads(supabase, packId);

  const { data: packRow, error: packErr } = await supabase
    .from("packs")
    .select("tune_id")
    .eq("id", packId)
    .single();
  if (packErr) throw packErr;

  let tuneId = packRow?.tune_id;
  if (!tuneId) {
    const sanitizedName = `Pack${packId.replace(/[^a-zA-Z0-9 ]/g, "")}`;
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
          branch: "fast",
          image_urls: imageUrls,
          token: "ohwx",
          steps: 50
        },
      }),
    });
    if (!tuneRes.ok) throw new Error(await tuneRes.text());
    const tuneData = await tuneRes.json();
    tuneId = tuneData.id;
    await supabase.from("packs").update({ tune_id: tuneId }).eq("id", packId);
  }

  await waitForTuneReady(tuneId);

  const promptRes = await fetch(`${process.env.SITE_URL}/api/generate-prompts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, packId, packType }),
  });
  if (!promptRes.ok) throw new Error("Prompt fetch failed");
  const { prompts } = await promptRes.json();

  for (const promptText of prompts) {
    const astriaPrompt = `sks ${gender} ${promptText}`;
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
    if (!sendRes.ok) continue;
    const { id: promptId } = await sendRes.json();
    if (!promptId) continue;

    let images: string[] = [];
    for (let i = 0; i < 10; i++) {
      images = await waitForPromptImages(tuneId, promptId);
      if (images.length === 3) break;
      await new Promise((r) => setTimeout(r, 3000));
    }

    const insertData = images.map((url) => ({
      prompt_id: promptId,
      pack_id: packId,
      image_url: url,
      url: `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
      created_at: new Date().toISOString(),
    }));
    await supabase.from("generated_images").insert(insertData);
  }

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
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      userEmail = session.customer_details?.email ?? "";
    } else {
      userEmail = usr.email;
      firstName = usr.first_name;
      lastName = usr.last_name;
    }
  } catch (err) {
    console.error("❌ Could not load user info:", err);
  }

  const webhookUrl = process.env.GHL_INBOUND_WEBHOOK_URL!;
  if (userEmail) {
    const { data: allRows } = await supabase
      .from("generated_images")
      .select("image_url")
      .eq("pack_id", packId);

    const galleryUrls = (allRows || []).map((r) => r.image_url);

    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        firstName,
        lastName,
        packId,
        galleryUrls,
      }),
    });
  }

  setTimeout(async () => {
    const { data: rowsAfter20 } = await supabase
      .from("generated_images")
      .select("image_url")
      .eq("pack_id", packId);

    const count = (rowsAfter20 || []).length;
    if (count < 45 && userEmail) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          firstName,
          lastName,
          packId,
          galleryUrls: rowsAfter20?.map((r) => r.image_url) || [],
          note: `Only ${count}/45 images completed after 20 minutes.`,
        }),
      });
    }
  }, 20 * 60 * 1000);
}

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
