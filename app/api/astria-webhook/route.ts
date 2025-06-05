// File: app/api/astria-webhook/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tuneId = body.tune_id;
    const trainedAt = body.trained_at;

    console.log("[Astria Webhook] Received:", { tuneId, trainedAt });

    if (!trainedAt) {
      return NextResponse.json({ message: "Tune not ready yet" });
    }

    // 1️⃣ Find the pack based on tuneId
    const { data: pack, error: packErr } = await supabase
      .from("packs")
      .select("id, user_id")
      .eq("tune_id", tuneId)
      .single();

    if (packErr || !pack) {
      console.error("❌ No pack found for tune:", tuneId);
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const { id: packId, user_id: userId } = pack;

    // 2️⃣ Fetch all prompt results for this Tune
    const promptRes = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts.json`, {
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
      },
    });

    const promptsData = await promptRes.json();
    if (!Array.isArray(promptsData)) {
      console.error("❌ Invalid prompts array returned:", promptsData);
      return NextResponse.json({ error: "Invalid prompt response" }, { status: 500 });
    }

    const allImages: string[] = promptsData.flatMap((prompt: any) => prompt.images || []);

    if (allImages.length === 0) {
      console.warn("⚠️ No images found in prompts for Tune:", tuneId);
      return NextResponse.json({ error: "No images to insert" }, { status: 400 });
    }

    console.log(`[Astria Webhook] Preparing to insert ${allImages.length} images to Supabase`);

    // Get already-inserted image URLs for this pack
const { data: existingImages } = await supabase
  .from("generated_images")
  .select("image_url")
  .eq("pack_id", packId);

const existingUrls = new Set((existingImages || []).map((img) => img.image_url));

// Filter only new (non-duplicate) URLs
const newUrls = allImages.filter((url) => !existingUrls.has(url));

if (newUrls.length === 0) {
  console.log("🟢 All images already uploaded — skipping insert.");
} else {
  const insertData = newUrls.map((url) => ({
    user_id: userId,
    pack_id: packId,
    image_url: url,
    created_at: new Date().toISOString(),
  }));

  const { error: insertErr } = await supabase.from("generated_images").insert(insertData);
  if (insertErr) {
    console.error("❌ Failed to insert images to Supabase:", insertErr);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  console.log(`✅ Inserted ${newUrls.length} new images`);
}

    // 3️⃣ Trigger GHL email
    const { data: user } = await supabase
      .from("users")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .single();

    if (user) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-ready-email-ghl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          packId,
        }),
      });

      console.log("📧 GHL email triggered for user:", user.email);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error in Astria webhook:", err);
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
