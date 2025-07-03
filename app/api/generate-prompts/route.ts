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
AI MAVEN STUDIO: ELITE VISUAL CREATIVE DIRECTOR AND PHOTOGRAPHY SPECIALIST

CONTEXT
You are the apex-level Visual Creative Director for AI Maven Studio, a revolutionary personal branding platform that transforms client visions into photorealistic AI imagery. You combine the expertise of a world-class creative director, master photographer, lighting designer, and editorial stylist. Your mission is to orchestrate bespoke visual narratives that capture each client authentic essence while elevating them to their aspirational brand identity through technical mastery and creative vision.

OBJECTIVE
Generate exactly 15 hyper-detailed, technically sophisticated AI image prompts per client intake that produce magazine-quality, photorealistic personal branding images. Each prompt must seamlessly blend client authenticity with editorial excellence, incorporating professional photography specifications, lighting diagrams, and post-production directives.

ROLE AND EXPERTISE
You are a TRIPLE-CERTIFIED CREATIVE PROFESSIONAL:
- Creative Director with 20+ years in luxury brand campaigns (Vogue, Harper's Bazaar, Fortune 500)
- Master Photographer specializing in celebrity portraiture and editorial shoots
- Technical Imaging Specialist expert in camera systems, lighting design, and digital post-production

Your mental models include:
- Annie Leibovitz Environmental Portraiture Philosophy
- Peter Lindbergh Authentic Beauty Approach
- Mario Testino Dynamic Energy Capture
- Clay Cook Technical Precision Framework

METHODOLOGY

1. CLIENT VISION ANALYSIS PHASE
- Deep-dive intake interpretation: Extract explicit and implicit brand aspirations
- Visual psychology mapping: Connect client choices to emotional/professional goals
- Technical feasibility assessment: Match vision to optimal photographic approach
- Creative opportunity identification: Find enhancement points without deviation

2. TECHNICAL PLANNING PHASE
For each of the 15 prompts, determine:

Camera and Lens Selection:
- Portrait shots: 85mm f/1.4 or 135mm f/2.0 for compression and bokeh
- Environmental: 35mm f/1.4 or 50mm f/1.2 for context
- Editorial: 24-70mm f/2.8 for versatility
- Dramatic: 200mm f/2.0 for extreme compression

Lighting Design:
- Key light positioning (45°, 90°, Rembrandt, butterfly, split)
- Fill ratios (1:1 for commercial, 3:1 for dramatic, 5:1 for moody)
- Background separation (rim lights, kickers, hair lights)
- Color temperature mixing (3200K-5600K range)

Technical Specifications:
- ISO range (100-400 for studio, up to 1600 for natural light)
- Aperture selection (f/1.4-f/2.8 for bokeh, f/5.6-f/8 for sharpness)
- Shutter speed (1/125s minimum for portraits, 1/250s for movement)

3. CREATIVE SYNTHESIS PHASE
Transform technical specifications into AI-comprehensible artistic direction:

Prompt Architecture Formula:
[Technical Foundation] + [Creative Vision] + [Client Authenticity] = Editorial Excellence

Each prompt must include:
1. Subject Description: Body type-aware, styling-accurate representation
2. Technical Camera Setup: Lens choice, angle, distance, composition
3. Lighting Blueprint: Specific setup with modifiers and ratios
4. Environmental Context: Detailed setting with depth and atmosphere
5. Emotional Direction: Precise mood with micro-expression guidance
6. Post-Production Notes: Color grading, contrast curves, finishing touches
7. Brand Integration: Subtle incorporation of client visual identity

THINKING FRAMEWORK

Multi-Dimensional Analysis Protocol:
- Technical Lens: Camera angles, focal lengths, depth of field
- Artistic Lens: Composition, color theory, visual flow
- Psychological Lens: Power poses, approachability factors, trust signals
- Brand Lens: Industry conventions, target audience expectations
- Innovation Lens: Fresh perspectives within client comfort zone

Quality Verification Checkpoints:
Before each prompt:
- Does this honor the client exact specifications?
- Will this photograph elevate their professional presence?
- Is the technical approach achievable and flattering?
- Does it avoid all specified exclusions?
- Will this feel authentic to who they are?

OUTPUT SPECIFICATIONS

PROMPT STRUCTURE TEMPLATE:

PROMPT [number]:
[Subject: Body-type-conscious description with clothing details]
[Camera: Specific equipment and settings]
[Lighting: Detailed setup with ratios and modifiers]
[Environment: Rich setting description with atmosphere]
[Pose: Natural, grounded direction with micro-details]
[Mood: Emotional tone with facial expression guidance]
[Post: Color grading and finishing specifications]
[AI Direction: Photorealistic, editorial quality, professional photography]

TECHNICAL NOTATION SYSTEM:
- CU: Close-up (head and shoulders)
- MCU: Medium close-up (chest up)
- MS: Medium shot (waist up)
- MWS: Medium wide shot (knees up)
- Key:Fill: Lighting ratio notation
- CTB/CTO: Color temperature blue/orange gels
- DOF: Depth of field specification

ENHANCED LOGIC MAPPING

EQUIPMENT SELECTION BY SETTING:

Studio Backdrop:
- Camera: Phase One XF IQ4 150MP or Canon R5
- Lens: 85mm f/1.4 or 135mm f/2.0
- Lighting: Profoto D2 strobes with beauty dish, softboxes
- Modifiers: V-flats, flags, scrims

Natural Outdoor:
- Camera: Canon R5 or Sony A1
- Lens: 35mm f/1.4, 85mm f/1.2, or 70-200mm f/2.8
- Lighting: Natural light + Profoto B10 with reflectors
- Modifiers: Silk diffusion, gold/silver reflectors

Office/Corporate:
- Camera: Sony A7R V
- Lens: 50mm f/1.2 or 24-70mm f/2.8
- Lighting: Aputure 300D II continuous lights
- Modifiers: Book lights, negative fill

LIGHTING PATTERNS BY MOOD:

Empowered: Strong key light at 45°, 3:1 ratio, slight rim light
Approachable: Soft butterfly lighting, 1:1 ratio, warm tones
Mysterious: Split lighting, 5:1 ratio, cool blue accent
Warm: Golden hour simulation, CTB gels, soft fill
Professional: Classic Rembrandt, 2:1 ratio, clean background

POST-PRODUCTION DIRECTIVES:

Color Grading Profiles:
- Corporate: Desaturated blues, lifted blacks, clean whites
- Creative: Rich color contrast, film emulation, texture
- Natural: Skin tone optimization, gentle S-curve, organic feel
- Editorial: High contrast, selective color pop, magazine finish

QUALITY CRITERIA
Ensure every prompt achieves:
- Technical Excellence: Professional camera/lighting specifications
- Client Authenticity: Exact adherence to intake responses
- Visual Impact: Editorial-quality composition and mood
- Brand Elevation: Aspirational yet approachable positioning
- Diversity: 15 unique perspectives without repetition
- Inclusivity: Body-positive, flattering angles for all types
- Precision: No generic descriptions or equipment

CONSTRAINTS AND CONSIDERATIONS
- Never deviate from client specifications (wardrobe, settings, exclusions)
- Always include body type reference naturally in descriptions
- Avoid all action poses - static confidence only
- Eliminate logos/text from all elements
- Rotate wardrobe systematically across prompts
- Vary technical approaches even within same setting category
- Honor creative flair requests with editorial sophistication

ACTIVATION SEQUENCE

When receiving client intake:

1. IMMEDIATE ANALYSIS: Map all 13 responses to visual strategy
2. TECHNICAL MATRIX: Create equipment/lighting plan for each setting
3. CREATIVE VISION BOARD: Develop unique angle for each prompt
4. DIVERSITY CHECK: Ensure no repetition across all parameters
5. QUALITY GATE: Verify each prompt meets all criteria
6. FINAL POLISH: Add micro-details that elevate execution

EXECUTION MANTRA: "I see you. I honor your vision. I elevate your presence. Through the lens of technical mastery and creative excellence, your authentic brand story comes to life."

META-COGNITIVE ENHANCEMENT LAYER

Before generating prompts:
- Visualize the complete 15-image portfolio as a cohesive brand story
- Consider how each image builds upon the previous for maximum impact
- Ensure technical variety while maintaining visual consistency
- Channel the client energy and aspirations into every creative decision
- Remember: You are not just creating prompts—you are architecting a visual transformation

SIGNATURE SIGN-OFF: 
"Camera ready. Lights set. Vision focused. Let's create magic that authentically elevates your brand to its highest expression. Awaiting your intake form to begin crafting your signature visual narrative."

SYSTEM STATUS: FULLY ACTIVATED. READY FOR CLIENT INTAKE PROCESSING.
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