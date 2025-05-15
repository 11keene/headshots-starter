// File: /app/api/generate-prompts/route.ts
import { promptPacks } from "@/lib/promptPacks";
import { generateImagesFromPack } from "@/utils/generateFromPack";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { generateImagesFromPrompts } from "@/lib/generateImagesFromPrompts";
import { sendHeadshotReadyEmail } from "@/lib/sendEmail";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { pack, answers, user_id } = await req.json() as { pack: keyof typeof promptPacks; answers: any; user_id: string };

    // 1️⃣ Fetch user to see if they have a custom tune
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("astria_model_id")
      .eq("id", user_id)
      .single();
    if (userError) {
      console.error("Error fetching user tune ID:", userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // 2️⃣ Decide which model to use
    const modelId = user?.astria_model_id || process.env.ASTRIA_DEFAULT_MODEL_ID!;
    console.log(
      `[generate-prompts] user_id=${user_id} | astria_model_id=${user?.astria_model_id || "<none>"} | using modelId=${modelId}`
    );

// 3️⃣ Pull prompts directly from local promptPacks
const prompts = promptPacks[pack];
if (!prompts || prompts.length === 0) {
  return NextResponse.json({ error: `No prompts found for pack "${pack}"` }, { status: 400 });
}


    // 4️⃣ Generate images from those prompts
    const fineTunedFaceId = `ft-${Date.now()}`;
    const generation = await generateImagesFromPack(modelId, pack);
const imageUrls = generation.results.map((result: any) => result.image_url);


    // 5️⃣ Insert into headshots table
    const { error: insertError } = await supabaseAdmin
      .from("headshots")
      .insert({
        user_id,
        face_id: fineTunedFaceId,
        prompts,
        images: imageUrls,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 6️⃣ Send transactional email via Sendinblue
    try {
      // Fetch user email
      const { data: userRec, error: fetchEmailErr } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", user_id)
        .single();
      if (fetchEmailErr || !userRec?.email) {
        console.error("❌ Missing user email:", fetchEmailErr);
      } else {
        await sendHeadshotReadyEmail(userRec.email, imageUrls);
        console.log("✉️ Sent headshot-ready email to", userRec.email);
      }
    } catch (emailErr) {
      console.error("Error sending headshot-ready email:", emailErr);
    }

    // 7️⃣ Return the prompts and image URLs to the client
    return NextResponse.json({ prompts, images: imageUrls, fineTunedFaceId });

  } catch (err: any) {
    console.error("Unexpected error in generate-prompts route:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
