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
  apiKey: process.env.OPENAI_API_KEY!, // Make sure this is set in your .env.local
});

// ────────────────────────────────────────────────────────────────────────────────
// Helper to build ChatGPT messages (instructions only – no “example valid” block).
// This forces the model to output exactly 15 prompts in a JSON array of 15 strings.
// ────────────────────────────────────────────────────────────────────────────────
function buildPromptMessages(
  intakeData: Record<string, any> | null,
  packType: string
): ChatCompletionMessageParam[] {
  const gptInstructions = {
    professional: `
This GPT takes a completed client intake form (in JSON) and produces exactly 15 tailored, photorealistic AI image prompts.  
Each of the 15 prompts must be directly based on the client’s answers (gender, body type, wardrobe, hair, setting, mood, brand colors, industry, etc.).  
You must output a single JSON array of exactly 15 strings—no bullet points, no markdown fences, no explanation, only a valid JSON array of 15 elements.

Each prompt (string) must:
- Be customized to the client’s data (real person, not stock).
- Vary in scene (studio, outdoor, editorial, conceptual, etc.), lighting, framing, and emotion.
- Include at least 8 different headshot-style prompts (close, chest-up, waist-up, or 3/4 body) across the 15.
- Avoid action poses (no walking, running, mid-step).
- At least 13 of the 15 prompts must include a setting or environment.
- For repeated background categories, vary the specific sub-environment (e.g. if two “Natural Outdoor” prompts, one could be garden, another forest).
- Vary lighting style (warm, cool, rim, ambient) so they don’t all look the same.
- If wardrobe categories overlap (e.g. “formal” vs “casual”), distribute them across different prompts so no prompt mixes categories unless explicitly stated by the client.

Creative Director Role:
- Do not add extra text—only output a JSON array of 15 prompt strings.
- Do not include text outside the JSON array.

Use the intakeData exactly as given. If any field is missing, still produce 15 prompts based on whatever is provided.

GPT Logic Mapping:
1. Gender: controls pronouns, styling language.
2. Body Type: mention “petite,” “curvy,” “broad-shouldered,” etc. in each prompt’s description.
3. Hair: For women, use hair texture (e.g. straight, wavy, curly, coily, locs). For men, “bald,” “buzz cut,” “medium,” “long,” or “locs.”
4. Wardrobe: If multiple categories (e.g. blazer vs casual), distribute them among prompts.
5. Background: Rotate through studio, natural, urban, conceptual.
6. Mood/Vibe: drives lighting and expression.
7. Brand Colors: mention subtle accents in props, lighting, or clothing.
8. Industry: incorporate “technology,” “healthcare,” etc. into the scene.
9. Photo Usage: if “LinkedIn,” make it formal headshot; if “social,” looser.
10. Avoid: follow any “things to avoid” the client listed.
11. Additional Notes: personalize at least one prompt with notes.

Each of the 15 strings returned must stand on its own as a complete prompt. Output only a JSON array of 15 elements, like:

["prompt-string-1", "prompt-string-2", …, "prompt-string-15"]
    `.trim(),

    "multi-purpose": `
This GPT acts as a creative director to convert a completed intake form into exactly 15 photorealistic AI image prompts.  
Output a single JSON array of 15 strings—no markdown, no extra explanation—only JSON.

Instructions for each of the 15:
- Tailor each prompt to one of the client’s roles (e.g. “entrepreneur,” “parent,” etc.) and match to its mood.
- Provide exact pose, styling, setting, lighting, and props (step-by-step clarity).
- No ambiguity—be precise.
- At least 8 of the 15 prompts must be headshots (close, chest-up, waist-up, or 3/4 body).
- Avoid action poses.
- Distribute wardrobe categories across the 15, not mixing them in a single prompt.
- Ensure a variety of backgrounds (studio, outdoor, conceptual).
- Use any client “additional notes” for at least one prompt.
- Use hair options as defined (straight, wavy, curly, coily, locs for women; bald, buzz cut, medium, long, locs for men).
- Include subtle brand color accents.
- Honor “things to avoid” verbatim.
- If any intake fields are missing, use what’s available to produce 15 prompts.

Output exactly:
["prompt-1", "prompt-2", …, "prompt-15"]
    `.trim(),
  };

  const chosenInstructions =
    gptInstructions[packType as "professional" | "multi-purpose"] ||
    gptInstructions.professional;

  const systemMessage: ChatCompletionMessageParam = {
    role: "system",
    content: chosenInstructions,
  };

  // We still send the raw JSON intake from your DB as the “user” message
  // so GPT can reference each field.
  const safeIntake = intakeData ?? {};
  const userMessage: ChatCompletionMessageParam = {
    role: "user",
    content: `Here is the intake data (as JSON):\n\n${JSON.stringify(
      safeIntake,
      null,
      2
    )}`,
  };

  return [systemMessage, userMessage];
}

// ────────────────────────────────────────────────────────────────────────────────
// POST handler for /api/generate-prompts — now calls OpenAI to generate 15 prompts.
// ────────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // 1) Parse incoming JSON and ensure packId is present
    const body = await req.json();
    console.log("[generate-prompts] incoming body:", body);
    const { packId } = body as { packId?: string };

    if (!packId) {
      console.error("[generate-prompts] ❌ Missing packId");
      return NextResponse.json({ error: "Missing packId" }, { status: 400 });
    }

    // 2) Fetch the pack row (to read pack_type + intake) from Supabase
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
    const intakeData: Record<string, any> | null = packRow.intake as Record<
      string,
      any
    >;

    console.log("[generate-prompts] packType =", packType);
    console.log("[generate-prompts] intakeData =", intakeData);

    // 3) Build the system+user messages for GPT
    const messages = buildPromptMessages(intakeData, packType);

    // 4) Call OpenAI to generate exactly 15 prompts in a JSON array
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-4" whichever you have access to
      messages,
      temperature: 0.2,
      max_tokens: 500, // increase max_tokens so the entire 15-element array can fit
      n: 1, // we ask for exactly one completion that contains 15 strings
    });

    const rawContent = completion.choices?.[0]?.message?.content;
    if (!rawContent) {
      console.error("[generate-prompts] ❌ No content from OpenAI.");
      return NextResponse.json({ error: "OpenAI returned no content." }, { status: 500 });
    }

    console.log("[generate-prompts] rawContent from OpenAI:", rawContent);

    // 5) Strip any markdown fences, then extract the JSON array substring
    let jsonText = rawContent.trim();
    if (jsonText.startsWith("```")) {
      // If GPT wrapped it in triple backticks, remove them:
      const parts = jsonText.split("\n");
      parts.shift();
      if (parts[parts.length - 1].trim() === "```") parts.pop();
      jsonText = parts.join("\n").trim();
    }

    // Find the first “[” and last “]” and slice out that full JSON array.
    const firstBracket = jsonText.indexOf("[");
    const lastBracket = jsonText.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonText = jsonText.substring(firstBracket, lastBracket + 1);
    }

    // 6) Parse into an array of strings, ensure length == 15
    let promptsArray: string[];
    try {
      promptsArray = JSON.parse(jsonText);
      if (!Array.isArray(promptsArray) || promptsArray.length !== 15) {
        throw new Error(
          `Parsed result is not a 15-element array (got ${JSON.stringify(promptsArray)})`
        );
      }
    } catch (parseErr) {
      console.error(
        "[generate-prompts] ❌ Could not parse JSON array (expecting 15 strings). JSON text was:",
        jsonText,
        parseErr
      );
      return NextResponse.json(
        { error: "OpenAI did not return a valid 15-element JSON array." },
        { status: 500 }
      );
    }

    console.log("[generate-prompts] promptsArray =", promptsArray);

    // 7) Insert all 15 prompts into Supabase “prompts” table
    const rowsToInsert = promptsArray.map((promptText) => ({
      pack_id: packId,
      prompt_text: promptText,
      created_at: new Date().toISOString(),
    }));

    const { error: insertErr } = await supabase.from("prompts").insert(rowsToInsert);
    if (insertErr) {
      console.error("[generate-prompts] ❌ Supabase insert error:", insertErr);
      // We still return the prompts to the client, even if insert fails
    } else {
      console.log("[generate-prompts] ✅ Stored 15 prompts in database");
    }

    // 8) Return the 15 prompts to the caller
    return NextResponse.json({ prompts: promptsArray }, { status: 200 });
  } catch (e: any) {
    console.error("[generate-prompts] ❌ Unexpected error:", e);
    return NextResponse.json({ error: e.message || "Something went wrong." }, { status: 500 });
  }
}

// Optional: block direct GET requests
export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
