// app/api/generate-images/route.ts


import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

console.log(
  "🚧 [generate-images] route.js loaded at " +
    new Date().toISOString()
);

// › provide a default if the env var wasn't set
const ASTRIA_API_URL = process.env.ASTRIA_API_URL ?? "https://api.astria.ai";
const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!;


// Wait until the image generation is ready
// Wait until the image generation is ready
async function pollAstriaPromptStatus(
  tuneId: string,
  promptId: string,
  timeoutMs = 120_000
): Promise<string[]> {
  const start = Date.now();

  while (true) {
    // ✅ Correct endpoint for checking a prompt
    const resp = await fetch(
      `${ASTRIA_API_URL}/tunes/${tuneId}/prompts/${promptId}.json`,
      { headers: { Authorization: `Bearer ${ASTRIA_API_KEY}` } }
    );

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(
        `Astria prompt status check failed: ${JSON.stringify(data)}`
      );
    }

    // ✅ Astria returns an `images` array once ready
    if (Array.isArray(data.images) && data.images.length > 0) {
      return data.images;
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error("Astria prompt timed out before ready");
    }

    // wait 3s before retrying
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

  // … after your promptRows check …

  // 1) Fetch tune_id + intake JSON so we can know the gender
  const { data: packData, error: packErr } = await supabase
    .from("packs")
    .select("tune_id, intake")
    .eq("id", packId)
    .single();

  if (packErr || !packData?.tune_id) {
    console.error("[generate-images] ❌ Failed to retrieve tune_id:", packErr);
    return NextResponse.json({ error: "Missing tune_id" }, { status: 500 });
  }

  const tuneId = packData.tune_id;
  const gender = packData.intake?.gender as string | undefined;
  if (!gender) {
    console.error("[generate-images] ❌ Missing gender:", packData.intake);
    return NextResponse.json({ error: "Missing gender" }, { status: 500 });
  }

  // NEW: Log how many prompts we have
  console.log(`[generate-images] ℹ️ Fetched ${promptRows.length} prompts for pack ${packId}`);

  const allImageUrls: string[] = [];

  // 2) For each prompt…
  for (const row of promptRows) {
    const originalPrompt = row.prompt_text;
    const astriaPrompt = `sks ${gender} ${originalPrompt}`;

    // NEW: log the exact text we’re sending
  console.log(`[generate-images] 🐞 astriaPrompt = "${astriaPrompt}"`);

    let astriaResp: Response;
    let astriaJson: any;
    let promptId: string;

    // 📣 DEBUG: see exactly what we’re sending
    console.log(`[generate-images] 🐞 astriaPrompt = "${astriaPrompt}"`);
    try {
      astriaResp = await fetch(
        `${ASTRIA_API_URL}/tunes/${tuneId}/prompts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ASTRIA_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: astriaPrompt,
            num_images: 3,
            super_resolution: true,
            inpaint_faces: true,
            width: 896,
            height: 1152,
            sampler: "euler_a",
          }),
        }
      );

      // ✅ safely parse
      try {
        astriaJson = await astriaResp.clone().json();
      } catch {
        const raw = await astriaResp.clone().text();
        console.error("[generate-images] ❌ Failed to parse JSON. Raw:", raw);
        continue;
      }

      // NEW: log status & body
      console.log(
        `[generate-images] 📬 Astria replied status=${astriaResp.status}, body=`,
        astriaJson
      );

      if (!astriaResp.ok) {
        console.error("[generate-images] ❌ Astria prompt error:", astriaJson);
        continue;
      }

      promptId = astriaJson.id;
      console.log(`[generate-images] 🚀 Prompt created: ${promptId}`);

const imageUrls = await pollAstriaPromptStatus(tuneId, promptId);
      console.log(
        `[generate-images] ✅ Prompt ${promptId} ready with ${imageUrls.length} images`
      );

      allImageUrls.push(...imageUrls);
    } catch (err) {
      console.error("[generate-images] ❌ Error sending prompt to Astria:", err);
      continue;
    }
  }

  console.log(`[generate-images] 🏁 Collected a total of ${allImageUrls.length} image URLs`);
  // … then your insert & status-update …


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
