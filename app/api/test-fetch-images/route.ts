// File: app/api/test-fetch-images/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const tuneId = "2702471"; // Replace with your test Tune ID
  const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY;

  if (!ASTRIA_API_KEY) {
    return NextResponse.json({ error: "Missing ASTRIA_API_KEY env variable" }, { status: 500 });
  }

  try {
    // Step 1: Fetch all prompts for the tune
    const res = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts.json`, {
      headers: {
        Authorization: `Bearer ${ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const prompts = await res.json();

    if (!Array.isArray(prompts)) {
      return NextResponse.json({ error: "Prompts not returned as array", raw: prompts }, { status: 500 });
    }

    // Step 2: For each prompt, fetch its image URLs
    const imageResults: { promptId: string; images: string[] }[] = [];

    for (const prompt of prompts) {
      const promptId = prompt.id;
      const url = `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`;

      const promptRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${ASTRIA_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const promptJson = await promptRes.json();

      if (Array.isArray(promptJson.images)) {
        imageResults.push({ promptId, images: promptJson.images });
      } else {
        console.warn(`Prompt ${promptId} has no images yet.`);
      }
    }

    const allImages = imageResults.flatMap((r) => r.images);
    return NextResponse.json({ count: allImages.length, allImages, raw: imageResults });
  } catch (err) {
    console.error("Error fetching prompts/images from Astria:", err);
    return NextResponse.json({ error: "Failed to fetch Astria images", details: err }, { status: 500 });
  }
}
