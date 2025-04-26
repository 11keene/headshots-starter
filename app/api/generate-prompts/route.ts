// app/api/generate-prompts/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { pack, answers } = await req.json();

  // Build our messages
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
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

  // Call GPT
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  const text = res.choices[0].message?.content || "";
  // Split into an array
  const prompts = text
    .split(/\n\d+\.\s*/)
    .map((p) => p.trim())
    .filter((p) => p);

  // Create a unique face ID
  const fineTunedFaceId = `ft-${Date.now()}`;

  return NextResponse.json({ prompts, fineTunedFaceId });
}
