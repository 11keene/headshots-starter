// File: /app/api/generate-prompts/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { generateImagesFromPrompts } from "@/lib/generateImagesFromPrompts";
import { sendHeadshotReadyEmail } from "@/lib/sendEmail";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { pack, answers, user_id } = await req.json() as { pack: string; answers: any; user_id: string };

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

    // 3️⃣ Generate prompts via ChatGPT
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: "You generate 16 headshot prompts." },
      {
        role: "user",
        content: `Pack: ${pack}\nAnswers:\n${JSON.stringify(answers, null, 2)}\nReply with a numbered list of 16 prompts.`,
      },
    ];

    const chatRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const rawText = chatRes.choices[0].message?.content || "";
    const prompts = rawText
      .split(/\n\d+\.\s*/)
      .map((p) => p.trim())
      .filter(Boolean);

    // 4️⃣ Generate images from those prompts
    const fineTunedFaceId = `ft-${Date.now()}`;
    const imageUrls = await generateImagesFromPrompts({
      prompts,
      fineTunedFaceId,
      modelId,
    });

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
