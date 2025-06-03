// app/api/generate-images/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const ASTRIA_API_URL = process.env.ASTRIA_API_URL!;
const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!;

// Helper: poll Astria’s status until `ready: true` or timeout
async function pollAstriaModelStatus(modelId: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (true) {
    const resp = await fetch(`${ASTRIA_API_URL}/models/${modelId}`, {
      headers: { Authorization: `Bearer ${ASTRIA_API_KEY}` },
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(`Astria status check failed: ${JSON.stringify(data)}`);
    }
    if (data.ready && Array.isArray(data.result_urls) && data.result_urls.length > 0) {
      return data.result_urls; // e.g. ["https://..."]
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("Astria model timed out before ready");
    }
    console.log(`[generate-images] Waiting for Astria model ${modelId} to be ready...`);
    await new Promise((r) => setTimeout(r, 3000)); // wait 3s
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { packId } = body;

    if (!packId) {
      console.error("[generate-images] ❌ Missing packId");
      return NextResponse.json({ error: "Missing packId" }, { status: 400 });
    }

    // 1) Fetch all prompts for this pack from Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: promptRows, error: promptErr } = await supabase
      .from("prompts")
      .select("prompt_text")
      .eq("pack_id", packId);

    if (promptErr) {
      console.error("[generate-images] ❌ Error fetching prompts:", promptErr);
      return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
    }
    if (!promptRows || promptRows.length === 0) {
      console.error("[generate-images] ❌ No prompts found for packId", packId);
      return NextResponse.json({ error: "No prompts found" }, { status: 404 });
    }

    // 2) For testing, pick just the first prompt
    const firstPrompt: string = (promptRows as { prompt_text: string }[])[0].prompt_text;
    console.log("[generate-images] firstPrompt =", firstPrompt);

    // 3) Call Astria’s /train or /generate endpoint with that single prompt
    //    Remember: for the “1 image” test, you set `count: 1`.
    const astriaResp = await fetch(`${ASTRIA_API_URL}/train`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Pack-${packId}`,
        subject: "professional headshot",  // or derive from pack_type if needed
        prompt: firstPrompt,
        count: 1, // only 1 image for the test run
      }),
    });

    const astriaJson = await astriaResp.json();
    if (!astriaResp.ok) {
      console.error("[generate-images] ❌ Astria train error:", astriaJson);
      return NextResponse.json({ error: "Astria training request failed" }, { status: 500 });
    }

    const astriaModelId: string = astriaJson.id || astriaJson.model_id;
    if (!astriaModelId) {
      console.error("[generate-images] ❌ No model_id returned from Astria:", astriaJson);
      return NextResponse.json({ error: "Astria did not return model_id" }, { status: 500 });
    }

    console.log("[generate-images] astriaModelId =", astriaModelId);

    // 4) Poll Astria until the model is ready and we get the result URLs
    let resultUrls: string[];
    try {
      resultUrls = await pollAstriaModelStatus(astriaModelId);
    } catch (pollErr) {
      console.error("[generate-images] ❌ Astria polling error:", pollErr);
      return NextResponse.json({ error: "Astria polling timed out" }, { status: 500 });
    }

    console.log("[generate-images] resultUrls =", resultUrls);

    // 5) Insert each returned URL into `generated_images`
    const rowsToInsert = resultUrls.map((url) => ({
      pack_id: packId,
      url,
      created_at: new Date().toISOString(),
    }));

    const { error: imgInsertErr } = await supabase.from("generated_images").insert(rowsToInsert);
    if (imgInsertErr) {
      console.error("[generate-images] ❌ Supabase insert generated_images failed:", imgInsertErr);
      return NextResponse.json({ error: "Failed to store generated images." }, { status: 500 });
    }

    console.log("[generate-images] ✅ Stored generated_images in DB");

    // 6) Update packs SET model_id = astriaModelId, status = "completed"
    const { error: packUpdateErr } = await supabase
      .from("packs")
      .update({ model_id: astriaModelId, status: "completed" })
      .eq("id", packId);

    if (packUpdateErr) {
      console.error("[generate-images] ❌ Supabase update packs failed:", packUpdateErr);
      // We can still return the images, but note the DB update failed
    }

    // 7) Return the first image URL (or all of them)
    return NextResponse.json({ images: resultUrls }, { status: 200 });
  } catch (e: any) {
    console.error("[generate-images] ❌ Unexpected error:", e);
    return NextResponse.json({ error: e.message || "Something went wrong." }, { status: 500 });
  }
}
