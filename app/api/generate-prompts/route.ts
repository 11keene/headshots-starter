import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { pack, answers } = await req.json();

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: "You generate 16 headshot prompts." },
      {
        role: "user",
        content: `Pack: ${pack}\nAnswers:\n${JSON.stringify(
          answers,
          null,
          2
        )}\nReply with a numbered list of 16 prompts.`,
      },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const text = res.choices[0].message?.content || "";
    const prompts = text
      .split(/\n\d+\.\s*/)
      .map((p) => p.trim())
      .filter((p) => p);

    const fineTunedFaceId = `ft-${Date.now()}`;

    const { error } = await supabase.from("headshots").insert({
      face_id: fineTunedFaceId,
      prompts,
      images: [],
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ error: "Supabase error" }, { status: 500 });
    }

    return NextResponse.json({ prompts, fineTunedFaceId });

  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
