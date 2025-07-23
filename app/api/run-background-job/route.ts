// File: app/api/run-background-job/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

// ──────────────────────────────────────────────────────────────────────────────
// Initialize the Stripe client (for event typing only)s
// ──────────────────────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// ──────────────────────────────────────────────────────────────────────────────
// Helper: Poll Supabase `uploads` table until image URLs appear
// ──────────────────────────────────────────────────────────────────────────────
async function waitForUploads(supabase: any, packId: string, maxAttempts = 300, delayMs = 2000): Promise<string[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[waitForUploads] Checking uploads for packId="${packId}" (attempt ${attempt}/${maxAttempts})`);
    const { data: rows, error } = await supabase.from("uploads").select("url").eq("pack_id", packId);

    if (error) throw error;
    if (rows && rows.length > 0) {
      console.log(`[waitForUploads] Found ${rows.length} upload(s)`);
      return rows.map((r: any) => r.url);
    }
    await new Promise((res) => setTimeout(res, delayMs));
  }
  throw new Error(`No uploaded images found for pack ${packId} after ${maxAttempts} attempts`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Helper: Wait for Astria tune to be ready
// ──────────────────────────────────────────────────────────────────────────────
async function waitForTuneReady(tuneId: string, maxAttempts = 240, delayMs = 5000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(`https://api.astria.ai/tunes/${tuneId}`, {
      headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.status === "ready" || data?.trained_at) {
        console.log(`✅ Tune ${tuneId} is ready.`);
        return;
      }
    }
    await new Promise((res) => setTimeout(res, delayMs));
  }
  throw new Error(`Tune ${tuneId} not ready after timeout.`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Helper: Poll Astria prompt endpoint for generated images
// ──────────────────────────────────────────────────────────────────────────────
async function waitForPromptImages(tuneId: string, promptId: string, maxAttempts = 60, delayMs = 3000): Promise<string[]> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`, {
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.images) && data.images.length > 0) {
        return data.images;
      }
    }
    await new Promise((res) => setTimeout(res, delayMs));
  }
  throw new Error(`Prompt ${promptId} did not return images after timeout.`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Route Handler: POST
// ──────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const { event } = await req.json();
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};

  const userId = metadata.user_id;
  const packId = metadata.packId;
  const gender = metadata.gender;
  const packType = metadata.packType;

  const supabase = createRouteHandlerClient({ cookies: () => cookies() });

  try {
    const imageUrls = await waitForUploads(supabase, packId);

    const ctRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/astria/create-tune`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, packId, imageUrls }),
    });
    const { tuneId } = await ctRes.json();
    await waitForTuneReady(tuneId);

    const promptRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-prompts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId, gender, packType, userId }),
    });
    const { prompts } = await promptRes.json();

    for (const promptText of prompts) {
      const astriaPrompt = `sks ${gender} ${promptText}`;
      const promptRes = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts`, {
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
      });

      const data = await promptRes.json();
      const promptId = data?.id;
      if (!promptId) continue;

      const images = await waitForPromptImages(tuneId, promptId);

      const records = images.map((url) => ({
        prompt_id: promptId,
        pack_id: packId,
        image_url: url.trim(),
        url: `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("generated_images").insert(records);
      if (error) console.error("Insert error:", error);
    }

    console.log("✅ All prompts processed.");
    return NextResponse.json({ status: "completed" });
  } catch (err) {
    console.error("❌ Background job error:", err);
    return NextResponse.json({ error: "Background job failed" }, { status: 500 });
  }
} 
