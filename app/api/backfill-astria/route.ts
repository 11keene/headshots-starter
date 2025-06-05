// File: app/api/backfill-upload-images/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tuneId = url.searchParams.get("tuneId");
  const userId = url.searchParams.get("userId");
  const packId = url.searchParams.get("packId");

  if (!tuneId || !userId || !packId) {
    return NextResponse.json({ error: "Missing tuneId, userId, or packId" }, { status: 400 });
  }

  try {
    const promptsRes = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts.json`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const promptsData = await promptsRes.json();
    if (!Array.isArray(promptsData)) {
      throw new Error("Astria prompts response was not an array");
    }

    const allImages = promptsData.flatMap((p: any) => p.images || []);

    if (allImages.length === 0) {
      return NextResponse.json({ message: "No images found for this tune." });
    }

    // Insert into Supabase
    const insertData = allImages.map((url: string) => ({
      user_id: userId,
      pack_id: packId,
      image_url: url,
    }));

    const { error: insertErr } = await supabase.from("generated_images").insert(insertData);

    if (insertErr) {
      console.error("❌ Supabase insert error:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: allImages.length });
  } catch (err: any) {
    console.error("❌ Error in backfill-upload-images:", err);
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
