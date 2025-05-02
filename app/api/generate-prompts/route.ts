import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { generateImagesFromPrompts } from "@/lib/generateImagesFromPrompts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Not anon key
);

export async function POST(req: Request) {
  const { pack, answers, user_id } = await req.json();

  // 👇 1. fetch the user’s custom Astria model ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("astria_model_id")
    .eq("id", user_id)
    .single();

  if (userError) {
    console.error("Error fetching user tune ID:", userError);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // 👇 2. pick the model: custom per‐user OR default from your .env
  const modelId = user?.astria_model_id || process.env.ASTRIA_DEFAULT_MODEL_ID; // 👈 added
  // …after you compute modelId…
console.log(`[generate-prompts] user_id=${user_id} | astria_model_id=${user?.astria_model_id} | using modelId=${modelId}`);


  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: "You generate 16 headshot prompts." },
    {
      role: "user",
      content: `Pack: ${pack}\nAnswers:\n${JSON.stringify(answers, null, 2)}\nReply with a numbered list of 16 prompts.`,
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
    .filter(Boolean);

  const fineTunedFaceId = `ft-${Date.now()}`;

  // 👇 3. pass the chosen modelId into your image‐generation helper
  const imageUrls = await generateImagesFromPrompts({
    prompts,
    fineTunedFaceId,
    modelId,                // 👈 added
  });

  const { error: insertError } = await supabase.from("headshots").insert({
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

  return NextResponse.json({ prompts, images: imageUrls, fineTunedFaceId });
}
