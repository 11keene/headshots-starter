// File: app/api/check-astria-status/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import fetch from "node-fetch"; // or global fetch if available

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);
  const promptId = url.searchParams.get("promptId");
  if (!promptId) {
    return NextResponse.json({ error: "Missing promptId" }, { status: 400 });
  }

  // 1) Hit Astria’s endpoint to see if the images are ready
  const astriaRes = await fetch(`https://api.astria.ai/prompts/${promptId}`);
  const astriaData = await astriaRes.json();
  const images: string[] = (astriaData.images || []).map((img: any) => img.url);

  // 2) If Astria returns at least one URL, update your “generated_images” table
  if (images.length > 0) {
    // Bulk update all records with this promptId to set their image_url
    await supabase
      .from("generated_images")
      .update({ image_url: images[0] }) // or handle multiple images however you like
      .eq("prompt_id", promptId);
    return NextResponse.json({ images });
  }

  // 3) Otherwise, still “not ready yet”
  return NextResponse.json({ images: [] });
}
