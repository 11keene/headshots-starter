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
    const tuneId   = body.tune_id;
    const trainedAt = body.trained_at;

    console.log("[Astria Webhook] Received:", { tuneId, trainedAt });

    if (!trainedAt) {
      return NextResponse.json({ message: "Tune not ready yet" });
    }

    // 1️⃣ Find the pack (and user) based on tuneId
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

    // 2️⃣ Fetch all prompt results for this Tune (15 prompts × 3 images each)
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

    // Flatten every prompt’s images into a single array of URLs (45 total)
    const allImages: string[] = promptsData.flatMap((prompt: any) => prompt.images || []);

    if (allImages.length === 0) {
      console.warn("⚠️ No images found in prompts for Tune:", tuneId);
      return NextResponse.json({ error: "No images to insert" }, { status: 400 });
    }

    console.log(`[Astria Webhook] Preparing to insert ${allImages.length} images to Supabase`);

    // 3️⃣ Fetch any URLs that are already in generated_images for this pack
    const { data: existingImages } = await supabase
      .from("generated_images")
      .select("image_url")
      .eq("pack_id", packId);

    const existingUrls = new Set((existingImages || []).map((img) => img.image_url));

    // 4️⃣ Keep only those URLs that aren’t already present
    const newUrls = allImages.filter((url) => !existingUrls.has(url));

    if (newUrls.length === 0) {
      console.log("🟢 All images already uploaded — skipping insert.");
    } else {
      // 5️⃣ Build an array of row‐objects that includes every one of the “new” URLs
      const insertData = newUrls.map((url) => ({
        user_id:    userId,
        pack_id:    packId,
        image_url:  url.trim(),
        created_at: new Date().toISOString(),
      }));

      // 6️⃣ Bulk‐insert ALL of those URLs in a single call
      const { error: insertErr, data: insertedRows } = await supabase
        .from("generated_images")
        .insert(insertData) as { error: any, data: any[] | null };

      if (insertErr) {
        console.error("❌ Failed to insert images to Supabase:", insertErr);
        return NextResponse.json({ error: "Insert failed" }, { status: 500 });
      }

      // insertedRows may be null or an array; ensure it's an array for .length
      console.log(`✅ Inserted ${Array.isArray(insertedRows) ? insertedRows.length : 0} new images`);
    }

    // 7️⃣ (Optional) Trigger your “talent‐ready” email
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
          lastName:  user.last_name,
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
