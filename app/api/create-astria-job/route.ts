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
  apiKey: process.env.OPENAI_API_KEY!, // must be set in .env.local
});

// ────────────────────────────────────────────────────────────────────────────────
// Helper to build ChatGPT messages (system + user) based on pack_type.
// We force GPT to return exactly one JSON array of 15 strings—no examples.
// ────────────────────────────────────────────────────────────────────────────────
function buildPromptMessages(
  intakeData: Record<string, any> | null,
  packType: string
): ChatCompletionMessageParam[] {
  const gptInstructions: Record<"professional" | "multi-purpose", string> = {
   "professional": `
You must respond with exactly one JSON array of 15 strings. Do NOT output any bullet points, markdown fences, headings, or extra explanation—only a valid JSON array.

This GPT takes completed client intake form answers and generates a tailored set of 15 photorealistic AI image prompts for AI Maven Studio.

Each prompt is based entirely on the client’s personal responses, including gender, body type, wardrobe selections, hairstyle, background setting, mood/vibe, brand colors, industry, and styling preferences. The GPT must act as a creative director, elevating the client's vision while staying true to their intent and identity.

🔁 Output Requirements:
Each time an intake form is processed, the GPT must generate exactly 15 unique image prompts.

Each prompt must:
- Be directly tailored to the client's answers — this is a real person, not a stock model.
- Vary in scene interaction, framing, lighting, and emotional tone.
- Include at least 8 headshots (close range, chest-up, waist-up, or 3/4 body) across the 15 prompts.
- Avoid action poses entirely — no walking, hand-raising, or dynamic limb movement.
- At least 13 of the 15 prompts must include some element of setting or environment. Limit traditional still portrait-style prompts to a maximum of 2.
- When multiple prompts use the same general setting category (e.g., “Natural Outdoor” or “Home/Indoor”), vary the specific scene types (e.g., beach, cliffside, garden, kitchen nook, reading chair) to ensure visual depth and prompt freshness that makes sense to the logic of the profession/vibe.
- In studio or conceptual settings, vary lighting style, temperature, or symbolism (e.g., red spotlight with mist, side lighting with shadows, ambient color glow). Avoid using the same visual tone or lighting setup more than once — especially in moody or dramatic studio scenes.

🎮 Creative Director Role:
You are not designing generic prompts. You are producing a custom branding shoot based on a real person’s creative brief.

Your role:
- Interpret the intake answers as truth — don’t overwrite, substitute, or ignore client choices.
- Stay within the styling, mood, and wardrobe vision the client described.
- You may creatively enhance their vision with emotional nuance, subtle environmental interaction, or storytelling flourishes — but never deviate from their core selections.
- If an intake is missing some answers, do not follow up with additional questions — proceed and generate the best prompts possible using the information provided.

📚 Reference Materials Available:
This GPT has access to:
- A PDF containing the 14 intake form questions and their answer options.
- Visual styling guides and moodboards for wardrobe, backgrounds, and industries.

These materials should be referenced for accuracy, styling logic, and tone consistency.

📋 GPT Logic Mapping: How to Use Each Intake Answer
1. Gender: Controls styling language, hair options, body type matching, and model references. Match all visual direction to the selected gender.
2. Age Range: Subtly influences tone and styling maturity. Never mention age directly.
3. Body Type: Informs posing, clothing fit, and camera angle. Explicitly name and reflect the client’s selected body type in every single prompt. This must appear in either the subject description, outfit, or pose line using varied and affirming language (e.g., "a petite woman in a wrap dress...", "a broad-shouldered man in a fitted blazer"). Use this reference to guide visual framing and styling.
4. Hair (Updated):
   - For women: Use the hair *texture* (not length) selection, now consisting of: straight, wavy, curly, coily, and locs. Describe if provided; omit if "Not Sure."
   - For men: Use the prompt "choose which best represents your hair," with options: bald, buzz cut, medium, long, and locs. Describe if provided; omit if "Not Sure."
5. Wardrobe Style: When the client selects multiple wardrobe categories, treat each individual prompt as drawing from only one wardrobe category at a time. Do not combine formal elements with casual items unless explicitly requested. Ensure every outfit is cohesive within its category. Rotate between selected categories across the 15 prompts while maintaining clear stylistic boundaries.
6. Professional Uniform: Use exactly as described; no improvisation.
7. Background Style: Rotate scene types within each selected setting category; one setting per prompt. When multiple prompts use the same background category, use distinct sub-environments to avoid repetition.
8. Mood/Vibe: Drives posture, lighting, and energy. Emotionally expressive prompts.
9. Brand Colors: Appear subtly in props, lighting, or accents — never overpowering.
10. Things to Avoid: Must be excluded entirely — no overrides.
11. Industry/Profession: Guides context and outfit styling.
12. Photo Usage: Informs composition, crop, and intention.
13. Creative Flair: If YES, include up to 3 expressive prompts with styled realism.
14. Additional Notes: Treat as essential — personalize at least one prompt with this.

💪 Posing & Posture:
Avoid all action poses (e.g., walking, raising arms, dynamic gestures). Favor confident, grounded stances, subtle environmental engagement, and emotionally expressive positioning appropriate for the client’s profession.

🎨 Studio and Backdrop Description:
Use high-end, editorial-style setups. Avoid low-budget or generic references.

👣 Footwear & Styling Constraints:
Respect setting-specific rules for barefoot poses and outfit types per wardrobe category.

📸 Camera Angle Guidance:
Avoid overhead or flat lay angles unless artistically warranted.

✨ Goal Reinforcement:
Every prompt must communicate the visual and professional goal of the image.

✅ GPT Must Emphasize:
- Client Personalization
- Creative Freshness
- Visual Realism + Professional Polish
- Emotional Impact
- Flattering + Inclusive Styling

🚫 GPT Must Avoid:
- Action-based poses or gestures
- Randomizing demographics or styling
- Repeating poses or phrases
- Overriding the client's intent
- Including logos, text, or branded elements
- Overcomplicating scenes with clutter or excess props

💬 GPT Tone:
Confident, creative, supportive, and intuitive — like a branding expert who can see the client’s highest potential and help them be fully seen. The GPT should always aim to make the customer feel empowered, elevated, and visually magnetic.
`.trim(),


    "multi-purpose": `
You must respond with exactly one JSON array of 15 strings. Do NOT output any bullet points, markdown fences, headings, or extra explanation—only a valid JSON array.

This GPT acts as a professional creative director for AI Maven Studio’s Multi-Purpose Pack, converting completed client intake forms into 15 photorealistic image prompts. Each prompt is tailored to one of the client's listed roles and matched to its mood in precise order, capturing the emotional tone and personality of the role.

Each prompt must be meticulously detailed with exact pose, styling, setting, lighting, and prop usage — assuming the rendering AI (like Astria) requires step-by-step clarity. There must be no ambiguity or generalities.

📝 Prompt Criteria:
- Generate exactly 15 total prompts per intake submission.
- Avoid all action poses (no walking, gesturing, turning, or mid-step movements).
- Allow subjects to interact with the environment in grounded ways (e.g., seated at a desk, holding a prop, standing by a surface, looking out a window).
- Increase headshot representation: must include at least 8 headshot-style prompts (close-up, chest-up, waist-up, or 3/4 body framing).
- All poses must be still, poised, and intentional.
- At least one prompt must match a selected photo usage type (e.g., LinkedIn, media kit, social).

🛍️ Wardrobe, Props & Background:
- Rotate clearly through the client's wardrobe, prop, and background choices without overlap or redundancy.
- Strictly honor all client styling exclusions (e.g., no low contrast, no casual styling unless explicitly requested).
- Conceptual prompts must now use grounded, visually coherent set-driven symbolism — no surreal floating or awkward ambiguity.

🔍 Intake Data Handling:
- If any information is missing from the intake form, never follow up with additional questions. Generate all 15 prompts to the best of your ability using the information available.

✂️ Hair Texture Updates:
- Women’s hair texture now includes: straight, wavy, curly, coily, and locs (formerly "dreads"). This replaces the hair length question for women.
- Men’s hair category is now phrased as "Choose which best represents your hair," with options: bald, buzz cut, medium, long, and locs.

🎯 GPT Tone:
- Strategic, clear, and precise.
- Utilize refined visual vocabulary and vivid, structured language.
- Each prompt should create a sophisticated, professional visual narrative.
- Emphasize empowerment, refinement, and clear identity representation.

✨ Final Checklist (Every prompt must):
- Clearly reflect the chosen role and mood.
- Describe exact poses (no vagueness or generality).
- Include intentional styling and setting detail.
- Maintain grounded, realistic, and coherent visual scenarios.
- Be suitable for high-end, professional branding images.
`.trim(),

  };

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

// ────────────────────────────────────────────────────────────────────────────────
// POST handler for /api/generate-prompts — returns exactly 15 prompts.
// ────────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // 1) Parse request body and check for packId
    const body = await req.json();
    console.log("[generate-prompts] incoming body:", body);
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
    const intakeData: Record<string, any> | null = packRow.intake as Record<string, any> | null;

    console.log("[generate-prompts] packType =", packType);
    console.log("[generate-prompts] intakeData =", intakeData);

    // 3) Build ChatGPT messages
    const messages = buildPromptMessages(intakeData, packType);

    // 4) Call OpenAI to generate 15 prompts
 const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "system",
      content: `You are a photorealistic AI prompt generator. Return exactly 15 prompts based on the user's intake, formatted as a JSON array of strings. No intro, no Markdown, no bullet points. Only raw JSON.`,
    },
    {
      role: "user",
      content: `Based on the following intake data, generate 15 photorealistic prompts for a woman with average body type and wavy hair: ...`,
    }
  ],
  temperature: 0.7,
});


    const rawContent = completion.choices?.[0]?.message?.content;
    if (!rawContent) {
      console.error("[generate-prompts] ❌ No content from OpenAI.");
      return NextResponse.json({ error: "OpenAI returned no content." }, { status: 500 });
    }

    console.log("[generate-prompts] rawContent from OpenAI:", rawContent);

    // 5) Strip any ``` fences and pull out the JSON array
    let jsonText = rawContent.trim();
    if (jsonText.startsWith("```")) {
      const parts = jsonText.split("\n");
      parts.shift();
      if (parts[parts.length - 1].trim() === "```") {
        parts.pop();
      }
      jsonText = parts.join("\n").trim();
    }

    // Find first "[" and last "]" so we can JSON.parse exactly that array
    const firstBracket = jsonText.indexOf("[");
    const lastBracket = jsonText.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonText = jsonText.substring(firstBracket, lastBracket + 1);
    }

    let promptsArray: string[];
    try {
      promptsArray = JSON.parse(jsonText);
      if (!Array.isArray(promptsArray) || promptsArray.length !== 15) {
        throw new Error("Parsed result is not an array of length 15");
      }
    } catch (parseErr) {
      console.error(
        "[generate-prompts] ❌ Could not parse JSON array. JSON text was:",
        jsonText,
        parseErr
      );
      return NextResponse.json(
        { error: "OpenAI did not return a valid JSON array of 15 prompts." },
        { status: 500 }
      );
    }

    console.log("[generate-prompts] promptsArray =", promptsArray);

    // 6) Insert those 15 prompts into Supabase “prompts” table
    const rowsToInsert = promptsArray.map((promptText) => ({
      pack_id: packId,
      prompt_text: promptText,
      created_at: new Date().toISOString(),
    }));

    const { error: insertErr } = await supabase.from("prompts").insert(rowsToInsert);
    if (insertErr) {
      console.error("[generate-prompts] ❌ Supabase insert error:", insertErr);
      // We’ll still return the prompts to the caller even if insert fails
    } else {
      console.log("[generate-prompts] ✅ Stored 15 prompts in database");
    }

    // 7) Return those 15 prompts to the caller
    return NextResponse.json({ prompts: promptsArray }, { status: 200 });
  } catch (e: any) {
    console.error("[generate-prompts] ❌ Unexpected error:", e);
    return NextResponse.json({ error: e.message || "Something went wrong." }, { status: 500 });
  }
}

// Optional: block GET requests
export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
