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
  apiKey: process.env.OPENAI_API_KEY!, // ensure this is set
});

// ────────────────────────────────────────────────────────────────────────────────
// Build the “system” prompt based on packType.  We no longer include any
// “example” JSON in the instructions—just “generate exactly 15 prompts”.
// ────────────────────────────────────────────────────────────────────────────────
function buildPromptMessages(
  intakeData: Record<string, any> | null,
  packType: string
): ChatCompletionMessageParam[] {
  // only instructions—no “example JSON”
  const gptInstructions: Record<string, string> = {
    professional: `
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
- Interpret the intake answers as truth—do not overwrite, substitute, or ignore client choices.  
- Stay within the styling, mood, and wardrobe vision the client described.  
- You may creatively enhance their vision with emotional nuance, subtle environmental interaction, or storytelling flourishes—but never deviate from their core selections.  
- If any intake field is missing, do not ask follow-up questions; simply generate the best possible 15 prompts.

📚 Reference Materials Available:
- A PDF containing the 14 intake form questions and their answer options.  
- Visual styling guides and moodboards for wardrobe, backgrounds, and industries.

Use these materials to stay accurate and on-brand.

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
- Client Personalization  
- Creative Freshness  
- Visual Realism + Professional Polish  
- Emotional Impact  
- Flattering & Inclusive Styling  

🚫 GPT Must Avoid:  
- Action-based poses or gestures  
- Randomizing demographics or styling  
- Repeating poses or phrases  
- Overriding the client’s intent  
- Including logos, text, or branded elements  
- Overcomplicating scenes with clutter or excess props  

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

  // pick the instructions for this packType (default to “professional” if unknown)
  const chosenInstructions =
    gptInstructions[packType as "professional" | "multi-purpose"] ||
    gptInstructions["professional"];

  const systemMessage: ChatCompletionMessageParam = {
    role: "system",
    content: chosenInstructions,
  };

  // the “user” message simply gives GPT the intake JSON
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
// POST handler for /api/generate-prompts — now correctly asks OpenAI for one JSON array
// of length 15 and parses it.  
// ────────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // 1) parse incoming JSON
    const body = await req.json();
    console.log("[generate-prompts] incoming body:", body);
    const { packId } = body as { packId?: string };
    if (!packId) {
      console.error("[generate-prompts] ❌ Missing packId");
      return NextResponse.json({ error: "Missing packId" }, { status: 400 });
    }

    // 2) fetch pack row from Supabase so we know pack_type + intake
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

    // 3) Build the system/user messages
    const messages = buildPromptMessages(intakeData, packType);

    // 4) Call OpenAI *once* (n: 1) and ask it to return a JSON array of length 15
    const completion = await openai.chat.completions.create({
  model: "gpt-4o", // or "gpt-4"
  response_format: { type: "json_object" }, // 👈 CRUCIAL
  messages: [
    {
      role: "system",
      content: "You are an expert AI prompt generator. Return ONLY a JSON array of 15 strings. No explanation, no markdown, no headers — just a JSON array of image prompts."
    },
    {
      role: "user",
      content: `Here is the intake: ${JSON.stringify(intakeData)}`
    }
  ]
});


    // rawContent should now look like:
    //   [
    //     "first prompt text …",
    //     "second prompt text …",
    //     … up to 15 items …
    //   ]
    const rawContent = completion.choices?.[0]?.message?.content;
    if (!rawContent) {
      console.error("[generate-prompts] ❌ No content from OpenAI.");
      return NextResponse.json(
        { error: "OpenAI returned no content." },
        { status: 500 }
      );
    }
    console.log("[generate-prompts] rawContent from OpenAI:", rawContent);

    // 5) strip fences/trailing text and extract the “[…]” block
    let jsonText = rawContent.trim();
    if (jsonText.startsWith("```")) {
      const parts = jsonText.split("\n");
      parts.shift();
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

    // 6) parse and validate it’s exactly a 15-element array
    let promptsArray: string[];
    try {
  const parsed = JSON.parse(jsonText);

  if (Array.isArray(parsed)) {
    promptsArray = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Object.keys(parsed).every((key) => !isNaN(Number(key)))
  ) {
    // Convert { "0": "...", "1": "...", ... } → [ "...", "..." ]
    promptsArray = Object.keys(parsed)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => parsed[key]);
  } else {
    throw new Error("Parsed result is not a valid array or object with numbered keys");
  }

  if (
    !Array.isArray(promptsArray) ||
    promptsArray.length !== 15 ||
    !promptsArray.every((el) => typeof el === "string")
  ) {
    throw new Error("Parsed result is not a 15-element string array");
  }
} catch (parseErr) {
  console.error(
    "[generate-prompts] ❌ Could not parse JSON array. JSON text was:",
    jsonText,
    parseErr
  );
  return NextResponse.json(
    { error: "OpenAI did not return a valid 15-element JSON array." },
    { status: 500 }
  );
}

    console.log("[generate-prompts] promptsArray =", promptsArray);

    // 7) insert those 15 prompts into Supabase “prompts” table
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
      // we still return the array below even if insert fails
    } else {
      console.log("[generate-prompts] ✅ Stored 15 prompts in database");
    }

    // 8) return that 15-element array to the caller
    return NextResponse.json({ prompts: promptsArray }, { status: 200 });
  } catch (e: any) {
    console.error("[generate-prompts] ❌ Unexpected error:", e);
    return NextResponse.json(
      { error: e.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

// Optional: block GET requests on this route
export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
