// File: app/api/custom-prompt/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { userId, intake } = await req.json();
  // build a descriptive text from intake answers
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a creative prompt generator for photoshoots." },
    { role: "user", content: `Create a concise photoshoot prompt based on these preferences: ${JSON.stringify(intake)}` },
  ];
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });
  const prompt = chat.choices[0].message?.content || "";
  return NextResponse.json({ prompt });
}
