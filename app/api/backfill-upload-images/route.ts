// File: app/api/backfill-upload-images/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tuneId = searchParams.get("tuneId");
  const userId = searchParams.get("userId");
  const packId = searchParams.get("packId");

  if (!tuneId || !userId || !packId) {
    return NextResponse.json(
      { error: "Missing one or more required query params" },
      { status: 400 }
    );
  }

  const res = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts.json`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  let data: any = [];
  try {
    data = await res.json();
  } catch (err) {
    console.error("Failed to parse JSON from Astria:", err);
    return NextResponse.json({ error: "Invalid JSON response" }, { status: 500 });
  }

  const imagesToInsert: { user_id: string; pack_id: string; image_url: string }[] = [];

  for (const prompt of data) {
    if (Array.isArray(prompt.images)) {
      for (const url of prompt.images) {
        imagesToInsert.push({
          user_id: userId,
          pack_id: packId,
          image_url: url,
        });
      }
    }
  }

  console.log(`[BACKFILL] Uploading ${imagesToInsert.length} images to Supabase`);

  if (imagesToInsert.length > 0) {
    const { error } = await supabase.from("generated_images").insert(imagesToInsert);
    if (error) {
      console.error("❌ Failed to insert images to Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    count: imagesToInsert.length,
    success: true,
    inserted: imagesToInsert.map((i) => i.image_url),
  });
}
