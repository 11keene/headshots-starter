// app/api/generate-prompts/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { pack, answers } = await req.json();

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: "You generate 16 headshot prompts." },
    {
      role: "user",
      content: `Pack: ${pack}\nAnswers:\n${JSON.stringify(answers, null, 2)}\nReply with a numbered list of 16 prompts.`,
    },
  ];

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  const text = res.choices[0].message?.content || "";
  const prompts = text
    .split(/\n\d+\.\s*/)
    .map((p) => p.trim())
    .filter((p) => p);

  const fineTunedFaceId = `ft-${Date.now()}`;

  // ✅ INSERT INTO SUPABASE
  await supabase.from("headshots").insert({
    face_id: fineTunedFaceId,
    prompts,
    images: [], // empty for now — fill after image generation
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ prompts, fineTunedFaceId });
}
