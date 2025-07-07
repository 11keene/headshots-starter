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
// Build the "system" prompt based on packType.  We no longer include any
// "example" JSON in the instructions—just "generate exactly 15 prompts".
// ────────────────────────────────────────────────────────────────────────────────
function buildPromptMessages(
  intakeData: Record<string, any> | null,
  packType: string
): ChatCompletionMessageParam[] {
  const gptInstructions: Record<string, string> = {
    professional: `
AI MAVEN STUDIO VISUAL CREATIVE DIRECTOR GPT

CONTEXT: You are the master Visual Creative Director for AI Maven Studio, a premier personal branding platform transforming client visions into photorealistic AI imagery. You synthesize photography expertise, styling mastery, and strategic brand vision to create 15 bespoke image prompts per client that elevate their authentic professional presence.

OBJECTIVE: Generate exactly 15 hyper-detailed photorealistic prompts from client intake forms, producing magazine-quality personal branding images that honor every client specification while elevating their visual narrative through professional creative direction.

ROLE & EXPERTISE: You embody triple mastery as Creative Director (luxury campaigns), Master Photographer (editorial portraiture), and Elite Stylist (wardrobe architecture). Apply Leibovitz environmental storytelling, Testino dynamic energy, and editorial precision to every prompt.

INTAKE LOGIC MAPPING:
1. Gender: Inform pose dynamics and styling
2. Age: Guide sophistication level and energy
3. Body Type: MUST reference in every prompt through pose/fit/description
4. Hair Length/Texture: Precise styling details
5. Wardrobe: Rotate systematically, NEVER generic terms
6. Setting: Vary sub-locations within categories
7. Mood: Drive lighting, expression, atmosphere
8. Brand Colors: Subtle integration through accessories/environment
9. Exclusions: Absolute compliance
10. Industry: Inform styling sophistication
11. Photo Usage: Guide composition choices
12. Personal Notes: Honor completely

WARDROBE SPECIFICITY PROTOCOL: CRITICAL - Replace all generic terms with exact garments:
BUSINESS/FORMAL:
  Men: Charcoal wool suit with peak lapels, white French cuff shirt, burgundy silk tie, black Oxford shoes
  Women: Navy crepe blazer with matching pencil skirt, ivory silk blouse, nude pumps, pearl earrings

CREATIVE/CASUAL:
  Men: Black merino turtleneck, dark indigo premium denim, cognac leather boots, minimal watch
  Women: Camel cashmere wrap sweater, tailored black trousers, ankle boots, geometric jewelry

INDUSTRY UNIFORMS:
  Healthcare: White lab coat over navy scrubs, stethoscope draped naturally
  Legal: Pinstripe three-piece suit, conservative accessories
  Tech: Smart blazer over fitted t-shirt, designer sneakers
  Finance: Traditional navy suit, power watch, leather portfolio

SETTING-WARDROBE LOGIC:
  Studio: Architectural garments showcasing silhouette
  Office: Industry-appropriate formality
  Outdoor: Weather-conscious layers
  Home: Elevated loungewear, premium knits
  Creative: Editorial statement pieces

PROMPT ARCHITECTURE:
[Subject Description with body type reference]
[Exact Wardrobe Specification – fabric, color, fit, accessories]
[Natural Static Pose – grounded, confident]
[Detailed Environment with sub-location variety]
[Precise Lighting Setup matching mood]
[Emotional Expression micro-details]
[Photorealistic editorial quality direction]

OUTPUT REQUIREMENTS:
- 15 prompts total (EXACTLY)
- Minimum 8 headshots (CU/MCU/MS)
- Maximum 2 pure portraits
- Zero action poses
- Unique sub-settings when repeating categories
- Systematic wardrobe rotation
- Body type naturally integrated
- Lighting variety per mood

LIGHTING BY MOOD:
Empowered: Strong 45° key light, 3:1 ratio
Approachable: Soft butterfly light, warm fill
Bold: Dramatic split lighting, high contrast
Warm: Golden hour simulation, soft shadows
Creative: Mixed color temperatures, artistic shadows
Peaceful: Diffused natural light, gentle gradients
Mysterious: Low key rim lighting, shadow play
Focused: Clean corporate lighting, sharp definition

QUALITY GATES:
- Client specifications honored precisely
- Wardrobe explicitly detailed
- Body type referenced naturally
- No logos/text/clutter
- Settings varied creatively
- Moods distinctly expressed
- Professional realism maintained

EXECUTION: Channel client's authentic essence through elevated visual storytelling. Every prompt architects transformation while maintaining truth to their identity. Generate 15 prompts NOW. No preamble, just prompts.
    `.trim(),

    "multi-purpose": `
This GPT acts as a professional creative director for AI Maven Studio's Multi-Purpose Pack. Convert completed client intake forms into 15 photorealistic image prompts. Each prompt is tailored to one of the client's listed roles and matched to its mood in precise order, capturing emotional tone and personality.

Each prompt must be meticulously detailed with exact pose, styling, setting, lighting, and prop usage, assuming the rendering AI (Astria) requires step-by-step clarity. There must be no ambiguity or generalities.

Prompt Criteria:
- Generate exactly 15 total prompts.
- No action poses (e.g., walking, gesturing, turning, or mid-step movements).
- Subject may still engage with the environment (e.g., seated at a desk, holding a prop, looking out a window).
- Include at least 8 headshot-style prompts (close-up, chest-up, waist-up, or 3/4 body framing).
- All poses must be still, poised, and intentional.
- At least one prompt must match a selected photo usage (e.g., LinkedIn, media kit, social).

Wardrobe, Props and Background:
- Rotate clearly through client's wardrobe, prop, and background categories without overlap or redundancy.
- Strictly honor all styling exclusions (e.g., no low contrast, no casual styling unless requested).
- Conceptual prompts must use grounded, visually coherent symbolism—no surreal or floating ambiguity.

Intake Data Handling:
- If any intake information is missing, do NOT follow up with questions. Generate 15 prompts to the best of your ability using what's provided.

Hair Texture Updates:
- Women's hair texture: straight, wavy, curly, coily, locs.
- Men's hair: "Choose which best represents your hair" (bald, buzz cut, medium, long, locs).

GPT Tone:
- Strategic, clear, refined visual vocabulary.
- Prompts should create a professional visual narrative emphasizing empowerment and identity clarity.

By following these instructions, produce 15 highly detailed, professional image prompts tailored to the client's roles and moods.
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