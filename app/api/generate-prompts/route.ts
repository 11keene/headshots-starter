// File: app/api/generate-prompts/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ────────────────────────────────────────────────────────────────────────────────
// Build the “system” prompt based on packType.  We no longer include any
// “example” JSON in the instructions—just “generate exactly 15 prompts”.
// ────────────────────────────────────────────────────────────────────────────────
function buildPromptMessages(
  intakeData: Record<string, any> | null,
  packType: string
): ChatCompletionMessageParam[] {
  const gptInstructions: Record<string, string> = {
    professional: `
This GPT takes completed client intake form answers and generates a tailored set of 15 photorealistic AI image prompts for AI Maven Studio.

Each prompt is based entirely on the client’s personal responses, including gender, body type, wardrobe selections, hairstyle, background setting, mood/vibe, brand colors, industry, and styling preferences. The GPT must act as a creative director, elevating the client's vision while staying true to their intent and identity.

🔁 Output Requirements:
• Each time an intake form is processed, the GPT must generate exactly 15 unique image prompts.
• Each prompt must:
  - Be directly tailored to the client's answers — this is a real person, not a stock model.
  - Vary in scene interaction, framing, lighting, and emotional tone.
  - Include at least 8 headshots (close range, chest-up, waist-up, or 3/4 body) across the 15 prompts.
  - Avoid action poses entirely — no walking, hand-raising, or dynamic limb movement.
  - At least 13 of the 15 prompts must include some element of setting or environment. Limit traditional still portrait-style prompts to a maximum of 2.
  - When multiple prompts use the same general setting category (e.g., “Natural Outdoor” or “Home/Indoor”), vary the specific scene types (e.g., beach, cliffside, garden, kitchen nook, reading chair) for visual depth and prompt freshness that makes sense to the profession/vibe.
  - In studio or conceptual settings, vary lighting style, temperature, or symbolism (e.g., red spotlight with mist, side lighting with shadows, ambient color glow). Avoid repeating the same lighting setup more than once.

🎮 Creative Director Role:
You are not designing generic prompts. You are producing a custom branding shoot based on a real person’s creative brief.
  - Interpret the intake answers as absolute truth—do not overwrite, substitute, or ignore client choices.
  - Stay within the styling, mood, and wardrobe vision the client described.
  - Creatively enhance their vision with emotional nuance, subtle environmental interaction, or storytelling flourishes—but never deviate from their core selections.
  - If any intake field is missing, do not ask follow-up questions; simply generate the best possible 15 prompts.

📋 GPT Logic Mapping: How to Use Each Intake Answer  
  1. Gender: Controls styling language, hair options, body type matching, and model references.  
  2. Age Range: Subtly influences tone and styling maturity—never mention age directly.  
  3. Body Type: Informs posing, clothing fit, camera angle—explicitly name the selected body type in every single prompt.  
  4. Hair (Updated):  
     - Women: use hair *texture* (straight, wavy, curly, coily, locs).  
     - Men: use “choose which best represents your hair” (bald, buzz cut, medium, long, locs).  
  5. Wardrobe Style: Rotate through each selected wardrobe category—never mix categories in one prompt.  
  6. Professional Uniform: Use exactly as described—no improvisation.  
  7. Background Style: Rotate distinct sub-environments within each chosen setting category.  
  8. Mood/Vibe: Drives posture, lighting, and energy.  
  9. Brand Colors: Appear subtly in props, lighting, or accents—never overpower.  
  10. Things to Avoid: Must be excluded entirely.  
  11. Industry/Profession: Guides context and outfit styling.  
  12. Photo Usage: Informs composition, crop, and intention.  
  13. Creative Flair: If YES, include up to 3 expressive prompts with styled realism.  
  14. Additional Notes: Treat as essential—personalize at least one prompt with any free-form notes.

💪 Posing & Posture:  
Avoid all action poses; favor confident, grounded stances, subtle environmental engagement, and emotionally expressive positioning appropriate for the client’s profession.

🎨 Studio & Backdrop:  
Use high-end, editorial-style setups—avoid low-budget or generic references.

👣 Footwear & Styling:  
Respect setting-specific rules (e.g., barefoot only if it makes sense).

📸 Camera Angle:  
Avoid overhead or flat-lay unless artistically warranted.

✨ Goal Reinforcement:  
Every prompt must communicate the visual and professional goal of the image.

✅ GPT Must Emphasize:  
• Client Personalization  
• Creative Freshness  
• Visual Realism + Professional Polish  
• Emotional Impact  
• Flattering & Inclusive Styling  

🚫 GPT Must Avoid:  
• Action-based poses or gestures  
• Randomizing demographics or styling  
• Repeating poses or phrases  
• Overriding the client’s intent  
• Including logos, text, or branded elements  
• Overcomplicating scenes with clutter or excess props  

💬 GPT Tone:  
Confident, creative, supportive, and intuitive—like a branding expert.  
    `.trim(),

    "multi-purpose": `
This GPT acts as a professional creative director for AI Maven Studio’s Multi-Purpose Pack. Convert completed client intake forms into 15 photorealistic image prompts. Each prompt is tailored to one of the client’s listed roles and matched to its mood in precise order, capturing emotional tone and personality.

Each prompt must be meticulously detailed with exact pose, styling, setting, lighting, and prop usage, assuming the rendering AI (Astria) requires step-by-step clarity. There must be no ambiguity or generalities.

📝 Prompt Criteria:
- Generate exactly 15 total prompts.
- No action poses (e.g., walking, gesturing, turning, or mid-step movements).
- Subject may still engage with the environment (e.g., seated at a desk, holding a prop, looking out a window).
- Include at least 8 headshot-style prompts (close-up, chest-up, waist-up, or 3/4 body framing).
- All poses must be still, poised, and intentional.
- At least one prompt must match a selected photo usage (e.g., LinkedIn, media kit, social).

🛍️ Wardrobe, Props & Background:
- Rotate clearly through client’s wardrobe, prop, and background categories without overlap or redundancy.
- Strictly honor all styling exclusions (e.g., no low contrast, no casual styling unless requested).
- Conceptual prompts must use grounded, visually coherent symbolism—no surreal or floating ambiguity.

🔍 Intake Data Handling:
- If any intake information is missing, do NOT follow up with questions. Generate 15 prompts to the best of your ability using what’s provided.

✂️ Hair Texture Updates:
- Women’s hair texture: straight, wavy, curly, coily, locs.
- Men’s hair: “Choose which best represents your hair” (bald, buzz cut, medium, long, locs).

🎯 GPT Tone:
- Strategic, clear, refined visual vocabulary.
- Prompts should create a professional visual narrative emphasizing empowerment and identity clarity.

By following these instructions, produce 15 highly detailed, professional image prompts tailored to the client’s roles and moods.
    `.trim(),
  };

  // Pick the correct instructions. Fallback to "professional" if unknown:
   const chosenInstructions =
    gptInstructions[packType as "professional" | "multi-purpose"] ||
    gptInstructions["professional"];

  const systemMessage: ChatCompletionMessageParam = {
    role: "system",
    content: chosenInstructions,
  };

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[generate-prompts] incoming body:", body);
    const { packId } = body as { packId?: string };
    if (!packId) {
      console.error("[generate-prompts] ❌ Missing packId");
      return NextResponse.json({ error: "Missing packId" }, { status: 400 });
    }

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
    const intakeData: Record<string, any> | null = (packRow.intake as any) || null;

    console.log("[generate-prompts] packType =", packType);
    console.log("[generate-prompts] intakeData =", intakeData);

    const messages = buildPromptMessages(intakeData, packType);
    const wrapperMessage: ChatCompletionMessageParam = {
      role: "system",
      content:
        "Now, return ONLY a raw JSON object with a single key 'prompts', whose value is an array of exactly 15 strings (_no_ explanation, no markdown, no headers). Example: { \"prompts\": [\"prompt1\", \"prompt2\", ...] }",
    };
    messages.push(wrapperMessage);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: messages,
      temperature: 0.8,
    });

    const rawContent = completion.choices?.[0]?.message?.content;

    // ✅ NEW: Defensive check before parsing
    if (!rawContent || rawContent.trim().length < 10) {
      console.error("[generate-prompts] ❌ OpenAI returned empty or too short content.");
      return NextResponse.json(
        { error: "OpenAI returned invalid content." },
        { status: 500 }
      );
    }

    console.log("[generate-prompts] rawContent from OpenAI:", rawContent);

    let promptsArray: string[];
    try {
      const parsed = JSON.parse(rawContent);
      if (
        !parsed ||
        !Array.isArray(parsed.prompts) ||
        parsed.prompts.length !== 15
      ) {
        throw new Error(
          "Parsed result does not have a 'prompts' array of 15 elements. Got: " +
            JSON.stringify(parsed)
        );
      }
      if (!parsed.prompts.every((el: any) => typeof el === "string")) {
        throw new Error("Parsed 'prompts' array did not contain only strings");
      }
      promptsArray = parsed.prompts as string[];
    } catch (parseErr) {
      console.error(
        "[generate-prompts] ❌ Could not parse JSON object. JSON text was:",
        rawContent,
        parseErr
      );
      return NextResponse.json(
        { error: "OpenAI did not return a valid JSON object with a 15‐element 'prompts' array." },
        { status: 500 }
      );
    }

    console.log("[generate-prompts] promptsArray =", promptsArray);

    const rowsToInsert = promptsArray.map((promptText) => ({
      pack_id: packId,
      prompt_text: promptText,
      created_at: new Date().toISOString(),
    }));
    const { error: insertErr } = await supabase
      .from("prompts")
      .insert(rowsToInsert);

    if (insertErr) {
      console.error("[generate-prompts] ❌ Supabase insert error:", insertErr);
    } else {
      console.log("[generate-prompts] ✅ Stored 15 prompts in database");
    }

    return NextResponse.json({ prompts: promptsArray }, { status: 200 });
  } catch (e: any) {
    console.error("[generate-prompts] ❌ Unexpected error:", e);
    return NextResponse.json(
      { error: e.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}