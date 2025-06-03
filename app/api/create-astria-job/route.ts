// File: app/api/create-astria-job/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// ────────────────────────────────────────────────────────────────────────────────
// POST handler: Receives { packId, prompts: [onePromptString] }, sends that prompt
// to Astria’s inference endpoint, stores the returned image URL in Supabase, and
// returns { image: "<astria-url>" } to the client.
// ────────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // 1) Parse JSON body; expect { packId: string, prompts: string[] }
    const body = await req.json();
    const { packId, prompts } = body as {
      packId?: string;
      prompts?: string[];
    };

    if (!packId || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        { error: "Missing packId or prompts" },
        { status: 400 }
      );
    }

    // 2) Pick the first (and only) prompt string
    const singlePrompt = prompts[0];

    // 3) Call Astria’s Inference endpoint
    //    Replace the URL, body format, and response parsing with exactly what Astria’s docs say.
    const astriaRes = await fetch("https://api.astria.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use your Astria API key from .env.local
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: singlePrompt,
        // You may need to include additional fields like width, height, model name, etc.
        width: 512,
        height: 512,
        model: "headshot-v1"
      }),
    });

    // 4) If Astria returns a non-200, log and error out
    if (!astriaRes.ok) {
      console.error(
        "[create-astria-job] Astria returned an error:",
        await astriaRes.text()
      );
      return NextResponse.json(
        { error: "Astria failed to generate image." },
        { status: 500 }
      );
    }

    // 5) Parse Astria’s response JSON. According to the example, the image URL is in data[0].url
    //    Adjust this to match Astria’s actual response format.
    const astriaJson = (await astriaRes.json()) as {
      data?: { url: string }[];
      // If Astria’s real response uses a different key, update this type.
    };

    if (!astriaJson.data || !Array.isArray(astriaJson.data) || astriaJson.data.length === 0) {
      console.error(
        "[create-astria-job] Astria’s response did not include data array:",
        astriaJson
      );
      return NextResponse.json(
        { error: "Astria did not return a valid image URL." },
        { status: 500 }
      );
    }

    // Grab the first image URL
    const imageUrl = astriaJson.data[0].url;
    console.log("[create-astria-job] Astria returned imageUrl =", imageUrl);

    // 6) Insert this URL into your Supabase “images” table
    const supabase = createRouteHandlerClient({ cookies });
    const { error: insertErr } = await supabase.from("images").insert([
      {
        pack_id: packId,
        url: imageUrl,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertErr) {
      console.error(
        "[create-astria-job] Supabase insert images error:",
        insertErr
      );
      // We can still return the URL even if DB insertion fails.
    }

    // 7) Return that single image URL to the front-end
    return NextResponse.json({ image: imageUrl }, { status: 200 });
  } catch (e: any) {
    console.error("[create-astria-job] Unexpected error:", e);
    return NextResponse.json(
      { error: e.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
