// app/api/generate-images/route.ts
import { NextResponse } from "next/server";
import Astria from "astria-client";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { prompts, fineTunedFaceId } = await req.json();
  const astria = new Astria({ apiKey: process.env.ASTRIA_API_KEY });

  // Send all prompts in parallel with super-res
  const jobs = prompts.map((p) =>
    astria.generate({ prompt: p, faceId: fineTunedFaceId, superResolution: true })
  );
  const results = await Promise.all(jobs);
  const imageUrls = results.map((r) => r.url);

  // Save into Supabase
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("headshots").insert({
    user_id: user?.id,
    face_id: fineTunedFaceId,
    images: imageUrls,
  });

  return NextResponse.json({ images: imageUrls });
}
