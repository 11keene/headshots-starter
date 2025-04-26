// app/api/generate-images/route.ts
import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  // 1) Parse body
  const { prompts, fineTunedFaceId } = await req.json();

  const apiKey = process.env.ASTRIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ASTRIA_API_KEY" },
      { status: 500 }
    );
  }

  // 2) Send each prompt to Astria’s REST API
  const jobs = prompts.map(async (prompt: string) => {
    const form = new FormData();
    form.append("prompt[text]", prompt);
    form.append("prompt[super_resolution]", "true");

    const res = await fetch(
      `https://api.astria.ai/tunes/${fineTunedFaceId}/prompts`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Astria API error: ${text}`);
    }

    const json = await res.json();
    return json.url as string;
  });

  let imageUrls: string[];
  try {
    imageUrls = await Promise.all(jobs);
  } catch (e: any) {
    console.error("Astria generation failed:", e);
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }

  // 3) Store results in Supabase
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("headshots").insert({
    user_id: user?.id,
    face_id: fineTunedFaceId,
    images: imageUrls,
  });

  // 4) Return the URLs
  return NextResponse.json({ images: imageUrls });
}
