// app/api/generate-images/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const ASTRIA_API_URL = process.env.ASTRIA_API_URL!;
const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!;

// Wait until the image generation is ready
async function pollAstriaPromptStatus(promptId: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (true) {
    const resp = await fetch(`${ASTRIA_API_URL}/prompts/${promptId}`, {
      headers: { Authorization: `Bearer ${ASTRIA_API_KEY}` },
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(`Astria prompt status check failed: ${JSON.stringify(data)}`);
    }
    if (data.ready && Array.isArray(data.result_urls) && data.result_urls.length > 0) {
      return data.result_urls;
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("Astria prompt timed out before ready");
    }
    console.log(`[generate-images] Waiting for prompt ${promptId} to be ready...`);
    await new Promise((r) => setTimeout(r, 3000));
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

    const { data: packData, error: packErr } = await supabase
      .from("packs")
      .select("tune_id")
      .eq("id", packId)
      .single();

    if (packErr || !packData?.tune_id) {
      console.error("[generate-images] ❌ Failed to retrieve tune_id:", packErr);
      return NextResponse.json({ error: "Missing tune_id" }, { status: 500 });
    }

    const tuneId = packData.tune_id;
    console.log("[generate-images] 🎨 Using tune ID:", tuneId);

    const allImageUrls: string[] = [];

    for (const row of promptRows) {
      const prompt = row.prompt_text;
      let astriaResp: Response;
      let astriaJson: any;
      let promptId: string;

      try {
        astriaResp = await fetch(`${ASTRIA_API_URL}/tunes/${tuneId}/prompts`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ASTRIA_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: prompt,
            num_images: 3,
            super_resolution: true,
            inpaint_faces: true,
            width: 896,
            height: 1152,
            sampler: "euler_a",
          }),
        });

        // ✅ Use clone() to safely parse
        try {
          astriaJson = await astriaResp.clone().json();
        } catch (err) {
          const rawText = await astriaResp.clone().text();
          console.error("[generate-images] ❌ Failed to parse JSON. Raw:", rawText);
          continue;
        }

        if (!astriaResp.ok) {
          console.error("[generate-images] ❌ Astria prompt error:", astriaJson);
          continue;
        }

        promptId = astriaJson.id;
        console.log(`[generate-images] 🚀 Prompt created: ${promptId}`);

        const imageUrls = await pollAstriaPromptStatus(promptId);
        console.log(`[generate-images] ✅ Prompt ${promptId} ready with ${imageUrls.length} images`);

        allImageUrls.push(...imageUrls);
      } catch (err) {
        console.error("[generate-images] ❌ Error sending prompt to Astria:", err);
        continue;
      }
    }

    const rowsToInsert = allImageUrls.map((url) => ({
      pack_id: packId,
      url,
      created_at: new Date().toISOString(),
    }));

    const { error: imgInsertErr } = await supabase.from("generated_images").insert(rowsToInsert);
    if (imgInsertErr) {
      console.error("[generate-images] ❌ DB insert failed:", imgInsertErr);
      return NextResponse.json({ error: "Failed to store generated images." }, { status: 500 });
    }

    const { error: packUpdateErr } = await supabase
      .from("packs")
      .update({ status: "completed" })
      .eq("id", packId);

    if (packUpdateErr) {
      console.error("[generate-images] ❌ Failed to update pack status:", packUpdateErr);
    }

    console.log("[generate-images] ✅ Finished image generation for pack:", packId);
    return NextResponse.json({ images: allImageUrls }, { status: 200 });

  } catch (e: any) {
    console.error("[generate-images] ❌ Unexpected error:", e);
    return NextResponse.json({ error: e.message || "Something went wrong." }, { status: 500 });
  }
}
