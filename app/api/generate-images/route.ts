// app/api/generate-images/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const { prompts, fineTunedFaceId } = (await req.json()) as {
    prompts: string[];
    fineTunedFaceId: string;
  };

  // … your Astria or Supabase setup …

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  // 1️⃣ assemble the prompts into a big string or messages array:
  const messages = [
    { role: "system", content: "You generate 16 headshot prompts." },
    { role: "user", content: prompts.join("\n") },
  ];

  // 2️⃣ Call OpenAI, but ignore the TS overload error on messages
  const aiRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    // @ts-ignore
    messages,
  });

  const text = aiRes.choices[0].message?.content || "";
  // … rest of your code …
  return NextResponse.json({ /* your response */ });
}
