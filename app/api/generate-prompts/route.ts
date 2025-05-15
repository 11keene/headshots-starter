// File: /app/api/generate-prompts/route.ts
import { promptPacks } from "@/lib/promptPacks";
import { generateImagesFromPack } from "@/utils/generateFromPack";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { generateImagesFromPrompts } from "@/lib/generateImagesFromPrompts";
import { sendHeadshotReadyEmail } from "@/lib/sendEmail";
import { createTune } from "@/utils/createTune"; // this should hit Astria's /tunes endpoint

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { pack, answers, user_id } = (await req.json()) as {
      pack: keyof typeof promptPacks | "defaultPack";
      answers: any;
      user_id: string;
    };
    const CUSTOM_BASE_PACK_ID = "1504944";

    // ── CUSTOM FLOW FOR "defaultPack" ──
    if (pack === "defaultPack") {
      console.log("→ Calling OpenAI with intake:", answers);

      // 1️⃣ Generate prompts from the user’s intake via OpenAI
      const chat = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You generate 16 headshot prompts." },
          {
            role: "user",
            content: `Based on these answers:\n${JSON.stringify(
              answers,
              null,
              2
            )}\nReply with a numbered list of 16 prompts.`,
          },
        ],
      });
      console.log("← OpenAI returned:", chat.choices[0].message?.content);
      const rawText = chat.choices[0].message?.content || "";
      const prompts = rawText
        .split(/\n\d+\.\s*/)
        .map((p) => p.trim())
        .filter(Boolean);

      // 2️⃣ Send those prompts directly to Astria
          // 2️⃣ Create a new Astria Tune from the user’s uploads
          const uploadedImages = answers.uploadedImages || [];
          if (!Array.isArray(uploadedImages) || uploadedImages.length < 3) {
            return NextResponse.json(
              { error: "At least 3 uploaded images are required to train a model." },
              { status: 400 }
            );
          }
          // use “man” or “woman” as the class_name for fine-tuning
          const className = answers.gender === "male" ? "man" : "woman";
    
          // train a new tune off your CUSTOM_BASE_PACK_ID
          const tune = await createTune(
            CUSTOM_BASE_PACK_ID,
            uploadedImages,
            className
          );
          const modelId = tune.id;
          const fineTunedFaceId = `ft-${Date.now()}`;
    
          // 3️⃣ Generate images from those prompts using the new tune
          const generation = await generateImagesFromPrompts({
            prompts,
            fineTunedFaceId,
            modelId,
          });
          const imageUrls = generation.map((item: { image_url: string }) => item.image_url);
    

      // 3️⃣ Insert into headshots table
      await supabaseAdmin.from("headshots").insert({
        user_id,
        face_id: fineTunedFaceId,
        prompts,
        images: imageUrls,
        created_at: new Date().toISOString(),
      });

      // 4️⃣ Send transactional email
      try {
        const { data: userRec, error: fetchEmailErr } = await supabaseAdmin
          .from("users")
          .select("email")
          .eq("id", user_id)
          .single();
        if (!fetchEmailErr && userRec?.email) {
          await sendHeadshotReadyEmail(userRec.email, imageUrls);
        }
      } catch {
        /* silent */
      }

      return NextResponse.json({ prompts, images: imageUrls, fineTunedFaceId });
    }
    // ── END CUSTOM FLOW ──

    // 1️⃣ Fetch user to see if they have a custom tune
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("astria_model_id")
      .eq("id", user_id)
      .single();
    if (userError) {
      console.error("Error fetching user tune ID:", userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // 2️⃣ Create a new Tune for this user using uploaded photos
    const uploadedImages = answers.uploadedImages || [];
    if (!Array.isArray(uploadedImages) || uploadedImages.length < 3) {
      return NextResponse.json(
        { error: "At least 3 uploaded images are required to train a model." },
        { status: 400 }
      );
    }

    const className = answers.gender === "male" ? "man" : "woman";
    const packIdMap: Record<string, string> = {
      "fitness-pack": "2123",
  "podcaster-pack": "2121",
  "tech-pack": "2120",
  "realtor-pack": "2118",
  "nurse-pack": "2114",
  "teacher-pack": "2110",
  "ceo-entrepreneur-pack": "2103",
  "starter-pack": "2033",
      // add your other themed pack IDs here
    };
    const packId = packIdMap[pack];
    if (!packId) {
      return NextResponse.json(
        { error: `Pack ID not found for ${pack}` },
        { status: 400 }
      );
    }

    const tune = await createTune(packId, uploadedImages, className);
    const modelId = tune.id;
    console.log(`[generate-prompts] user_id=${user_id} | trained new tuneId=${modelId}`);

    // 3️⃣ Pull prompts directly from local promptPacks
    const prompts = promptPacks[pack];
    if (!prompts || prompts.length === 0) {
      return NextResponse.json(
        { error: `No prompts found for pack "${pack}"` },
        { status: 400 }
      );
    }

    // 4️⃣ Generate images from those prompts
    const fineTunedFaceId = `ft-${Date.now()}`;
    const generation = await generateImagesFromPack(modelId, pack);
    console.log("⚠️ Full generation response:", generation);
    const imageUrls = generation.results.map((result: any) => result.image_url);

    // 5️⃣ Insert into headshots table
    const { error: insertError } = await supabaseAdmin
      .from("headshots")
      .insert({
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

    // 6️⃣ Send transactional email via Sendinblue
    try {
      const { data: userRec, error: fetchEmailErr } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", user_id)
        .single();
      if (!fetchEmailErr && userRec?.email) {
        await sendHeadshotReadyEmail(userRec.email, imageUrls);
        console.log("✉️ Sent headshot-ready email to", userRec.email);
      }
    } catch (emailErr) {
      console.error("Error sending headshot-ready email:", emailErr);
    }

    // 7️⃣ Return the prompts and image URLs to the client
    return NextResponse.json({ prompts, images: imageUrls, fineTunedFaceId });
  } catch (err: any) {
    console.error("Unexpected error in generate-prompts route:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
