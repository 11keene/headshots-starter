import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Setup Supabase with service role key (server-only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Astria API config
const ASTRIA_API_URL = "https://api.astria.ai/train"; // Update if needed
const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!;

export async function POST(req: Request) {
  try {
    const { packId } = await req.json();
    if (!packId) {
      return NextResponse.json({ error: "Missing packId" }, { status: 400 });
    }

    // Get uploaded image URLs
    const { data: uploads, error: uploadErr } = await supabase
      .from("uploads")
      .select("url")
      .eq("pack_id", packId);

    if (uploadErr || !uploads || uploads.length < 4) {
      console.error("❌ Upload fetch error or not enough images", uploadErr);
      return NextResponse.json({
        error: "At least 4 training images are required.",
      }, { status: 400 });
    }

    const imageUrls = uploads.map((u) => u.url);
    console.log(`📦 Training model for pack ${packId} with images:`, imageUrls);

    // Call Astria to train
    const response = await fetch(ASTRIA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `AI Maven Pack ${packId}`,
        subject: "professional headshot",
        images: imageUrls,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.id) {
      console.error("❌ Astria error response:", result);
      return NextResponse.json({ error: result.error || "Training failed" }, { status: 500 });
    }

    const modelId = result.id || result.model_id;
    console.log("✅ Astria model ID:", modelId);

    // Save model_id to packs table
    const { error: updateErr } = await supabase
      .from("packs")
      .update({ model_id: modelId })
      .eq("id", packId);

    if (updateErr) {
      console.error("❌ Failed to update model_id in Supabase:", updateErr);
      return NextResponse.json({ error: "Failed to update model_id" }, { status: 500 });
    }

    console.log("✅ Saved model_id to pack:", packId);
    return NextResponse.json({ success: true, modelId });
  } catch (e: any) {
    console.error("❌ Unhandled error in /train-model:", e);
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
}
