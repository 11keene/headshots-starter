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
    // -------------- NEW --------------
  // Astria expects a class name like "pack<id-without-hyphens>"
  const packIdNoHyphens = job.packId.replace(/-/g, "");
  const className       = `pack${packIdNoHyphens}`;
  // ----------------------------------
  const { userId, packId, gender, packType, sessionId } = job;
  if (packType === "multi-purpose") return;
  

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

  // (from step 2) we already computed:
  // const packIdNoHyphens = packId.replace(/-/g, "");
  // const className       = `pack${packIdNoHyphens}`;

  let tuneId = packRow?.tune_id;
  if (!tuneId) {
    console.log(`Creating new tune for pack ${packId} with className ${className}`);

    const tuneRes = await fetch("https://api.astria.ai/tunes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
      },
      body: JSON.stringify({
        tune: {
          name:           className,            // use hyphen-free className
          title:          `PackTune-${packId}`,
          branch:         "flux1",
          model_type:     "lora",
          face_detection: true,
          preset:         "flux-lora-portrait",
          image_urls:     imageUrls,
          token:          "sks",
          steps:          300,
          base_tune:      "flux.1 dev"
        },
      }),
    });

    if (!tuneRes.ok) {
      const errStatus = tuneRes.status;
      const errBody   = await tuneRes.text();
      console.error(`❌ Astria Tune creation error ${errStatus}:`, errBody);
      throw new Error(`Astria Tune failed ${errStatus}: ${errBody}`);
    }

    const tuneData = await tuneRes.json();
    tuneId = tuneData.id;
    await supabase
      .from("packs")
      .update({ tune_id: tuneId })
      .eq("id", packId);

    console.log(`✅ Created tune ${tuneId} for pack ${packId}`);
  }

  // 3) Wait for tune ready
  await waitForTuneReady(tuneId);

  // 4) Generate GPT prompts
  const promptRes = await fetch(`${process.env.SITE_URL}/api/generate-prompts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, packId, packType }),
  });
  if (!promptRes.ok) throw new Error("Prompt fetch failed");
  const { prompts } = await promptRes.json();

  // 5) Process each prompt
  for (const promptText of prompts) {
// after:
// inside your for-each-prompt loop, after tuneId and packId are known:

// 1) Reconstruct the exact tune name you used when creating it:

// 2) Prefix EVERY prompt text with both `sks` and your tuneName:
// Reuse the exact className we passed into tune.name
const astriaPrompt = `sks ${className} ${promptText}`;
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
      console.error(`❌ Failed to submit prompt to Astria: ${sendRes.status} ${errText}`);
      continue;
    }
    const { id: promptId } = await sendRes.json();
    if (!promptId) continue;

    let images: string[] = [];
    for (let i = 1; i <= 10; i++) {
      images = await waitForPromptImages(tuneId, promptId);
      if (images.length === 3) break;
      await new Promise((r) => setTimeout(r, 3000));
    }
    if (images.length !== 3) console.warn(`⚠️ Only received ${images.length}/3 images for prompt ${promptId}`);

    const insertData = images.map((url) => ({
      prompt_id: promptId,
      pack_id: packId,
      image_url: url,
      url: `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
      created_at: new Date().toISOString(),
    }));
    await supabase.from("generated_images").insert(insertData);
  }

  // 6) Fire GHL webhook
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
    console.error("❌ Could not load user info:", err);
  }

// 6) Send “Photos Ready” to Zapier (instead of GHL inbound)
  if (userEmail) {
    const { data: allRows } = await supabase
      .from("generated_images")
     .select("image_url")
      .eq("pack_id", packId);
    const galleryUrls = (allRows || []).map((r) => r.image_url);

    try {
      const payload = { email: userEmail, firstName, lastName, packId, galleryUrls };
      console.log("📣 Sending Photos Ready to Zapier:", payload);

      const zapRes = await fetch(process.env.ZAPIER_PHOTOS_READY_HOOK!, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
       body:    JSON.stringify(payload),
      });

      if (!zapRes.ok) {
        const text = await zapRes.text();
        console.error(`❌ Zapier hook failed (${zapRes.status}):`, text);
      } else {
        console.log("✅ Zapier Photos Ready webhook sent");
     }
   } catch (err) {
      console.error("❌ Error sending Zapier webhook:", err);
    }
  } else {
    console.warn("⚠️ No userEmail – skipping Zapier Photos Ready hook");
  }

  // 7) 20-minute fallback
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
        body: JSON.stringify({ email: userEmail, firstName, lastName, packId, galleryUrls: (rowsAfter20 ?? []).map((r) => r.image_url), note: `Only ${count}/45 images after 20 minutes` }),
      });
      console.log(`⚠️ Fallback GHL webhook sent`);
    }
  }, 20 * 60 * 1000);
}

async function main() {
  console.log("🚀 Worker started");
while (true) {
  const raw = await redis.rpop("jobQueue");
  if (!raw) {
    // nothing to do yet
    await new Promise((r) => setTimeout(r, 2000));
    continue;
  }

  console.log("🔄 Raw job from Redis:", raw);

  let job: {
    userId: string;
    packId: string;
    gender: string;
    packType: string;
    sessionId: string;
  };

  if (typeof raw === "string") {
    try {
      job = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Could not JSON.parse job payload:", raw, err);
      continue; // skip this bad entry
    }
  } else {
    job = raw;
  }

  console.log("🎯 Processing job:", job);
  await processJob(job);
}

}

main();
