// File: app/api/generate-prompts/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// ────────────────────────────────────────────────────────────────────────────────
// Initialize OpenAI client
// ────────────────────────────────────────────────────────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // Make sure this is set in .env.local
});

// ────────────────────────────────────────────────────────────────────────────────
// Helper to build ChatGPT messages, forcing a *pure* JSON‐only response.
// For testing, we ask for exactly one prompt instead of fifteen.
// If intakeData is null/undefined, pass an empty object.
// ────────────────────────────────────────────────────────────────────────────────
function buildPromptMessages(
  intakeData: Record<string, any> | null,
  packType: string
): ChatCompletionMessageParam[] {
  const systemMessage: ChatCompletionMessageParam = {
    role: "system",
    content: `
You are a seasoned creative director specializing in AI‐generated headshots.
Given a user’s intake data (as JSON) and their pack type (“${packType}”), produce **exactly one natural‐language image prompt** that will guide an AI to create a professional headshot.
Your **only output** must be a JSON array containing one string, for example:

["A professional headshot of a confident individual wearing a tailored suit with a neutral background, soft lighting, and a warm expression."]

Do not include any additional text, markdown fences, or commentary—**only** the JSON array with one string.
`.trim(),
  };

  const safeIntake = intakeData ?? {};
  const userMessage: ChatCompletionMessageParam = {
    role: "user",
    content: `Here is the intake data (as JSON):\n\n${JSON.stringify(safeIntake, null, 2)}`,
  };

  return [systemMessage, userMessage];
}

// ────────────────────────────────────────────────────────────────────────────────
// POST handler for /api/generate-prompts — now returns exactly one prompt.
// ────────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // 1) Parse request body and check for packId
    const body = await req.json();
    const { packId } = body as { packId?: string };

    if (!packId) {
      console.error("[generate-prompts] ❌ Missing packId");
      return NextResponse.json({ error: "Missing packId" }, { status: 400 });
    }

    // 2) Fetch the pack row (pack_type + intake) from Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: packRow, error: packErr } = await supabase
      .from("packs")
      .select("pack_type, intake")
      .eq("id", packId)
      .single();

    if (packErr || !packRow) {
      console.error("[generate-prompts] ❌ Could not fetch pack row:", packErr);
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const packType: string = packRow.pack_type;
    const intakeData: Record<string, any> | null = packRow.intake as
      | Record<string, any>
      | null;

    console.log("[generate-prompts] packType =", packType);
    console.log("[generate-prompts] intakeData =", intakeData);

    // 3) Build ChatGPT messages (asking for exactly one prompt)
    const messages = buildPromptMessages(intakeData, packType);

    // 4) Call OpenAI to generate one prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-4"
      messages,
      temperature: 0.7,
      max_tokens: 150, // enough for one prompt
      n: 1,
    });

    const rawContent = completion.choices?.[0]?.message?.content;
    if (!rawContent) {
      console.error("[generate-prompts] ❌ No content from OpenAI.");
      return NextResponse.json(
        { error: "OpenAI returned no content." },
        { status: 500 }
      );
    }

    console.log("[generate-prompts] rawContent =", rawContent);

    // 5) Clean up any markdown fences or extra text, then extract the JSON array
    let jsonText = rawContent.trim();

    if (jsonText.startsWith("```")) {
      const parts = jsonText.split("\n");
      if (parts[0].startsWith("```")) {
        parts.shift();
      }
      if (parts[parts.length - 1].trim() === "```") {
        parts.pop();
      }
      jsonText = parts.join("\n").trim();
    }

    const firstBracket = jsonText.indexOf("[");
    const lastBracket = jsonText.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonText = jsonText.substring(firstBracket, lastBracket + 1);
    }

    // 6) Parse the JSON array (should contain exactly one string)
    let promptsArray: string[];
    try {
      promptsArray = JSON.parse(jsonText);
      if (!Array.isArray(promptsArray) || promptsArray.length !== 1) {
        throw new Error("Parsed result is not a single-element array");
      }
    } catch (parseErr) {
      console.error(
        "[generate-prompts] ❌ Could not parse JSON array. JSON text was:",
        jsonText,
        parseErr
      );
      return NextResponse.json(
        { error: "OpenAI did not return a valid single-element JSON array." },
        { status: 500 }
      );
    }

    console.log("[generate-prompts] promptsArray =", promptsArray);

    // 7) Insert that one prompt into Supabase “prompts” table
    //    (Adjust column name if necessary—e.g. you might use "text" instead of "prompt_text")
    const rowsToInsert = promptsArray.map((promptText) => ({
      pack_id: packId,
      prompt_text: promptText,
      created_at: new Date().toISOString(),
    }));

    const { error: insertErr } = await supabase.from("prompts").insert(rowsToInsert);
    if (insertErr) {
      console.error("[generate-prompts] ❌ Supabase insert error:", insertErr);
      // Continue anyway so client still receives the prompt
    }

    console.log("[generate-prompts] ✅ Stored single prompt in database");

    // 8) Return that single prompt to the client
    return NextResponse.json({ prompts: promptsArray }, { status: 200 });
  } catch (e: any) {
    console.error("[generate-prompts] ❌ Unexpected error:", e);
    return NextResponse.json(
      { error: e.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
