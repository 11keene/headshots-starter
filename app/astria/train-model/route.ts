import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const astriaApiKey = process.env.ASTRIA_API_KEY;
const astriaTestModeIsOn = process.env.ASTRIA_TEST_MODE === "true";
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";
const appWebhookSecret = process.env.APP_WEBHOOK_SECRET;
const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

if (!appWebhookSecret) {
  throw new Error("MISSING APP_WEBHOOK_SECRET!");
}

export async function POST(request: Request) {
  const payload = await request.json();
  const images = payload.urls;
  const type = payload.type;
  const pack = payload.pack;
  const name = payload.name;
  const characteristics = payload.characteristics;

  const supabase = createRouteHandlerClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!astriaApiKey) {
    return NextResponse.json(
      { message: "Missing API Key: Add your Astria API Key to generate headshots" },
      { status: 500 }
    );
  }

  if (images?.length < 4) {
    return NextResponse.json({ message: "Upload at least 4 sample images" }, { status: 500 });
  }

  let creditRow = null;

  if (stripeIsConfigured) {
    const { error, data } = await supabase
      .from("credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error checking credits:", error);
      return NextResponse.json({ message: "Could not check credits." }, { status: 500 });
    }

    if (!data || data.credits < 1) {
      return NextResponse.json(
        { message: "Not enough credits. Please purchase credits and try again." },
        { status: 400 }
      );
    }

    creditRow = data;
  }

  const { error: modelError, data: modelData } = await supabase
    .from("models")
    .insert({ user_id: user.id, name, type })
    .select("id")
    .single();

  if (modelError) {
    console.error("modelError:", modelError);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }

  const modelId = modelData?.id;

  try {
    const deploymentUrl = process.env.DEPLOYMENT_URL || '';
    const baseUrl = deploymentUrl.startsWith('http') ? deploymentUrl : `https://${deploymentUrl}`;

    const trainWebhookWithParams = `${baseUrl}/astria/train-webhook?user_id=${user.id}&model_id=${modelId}&webhook_secret=${appWebhookSecret}`;
    const promptWebhookWithParams = `${baseUrl}/astria/prompt-webhook?user_id=${user.id}&model_id=${modelId}&webhook_secret=${appWebhookSecret}`;

    const DOMAIN = "https://api.astria.ai";
    const API_KEY = astriaApiKey;

    const tuneBody = {
      tune: {
        title: name,
        base_tune_id: 690204,
        name: type,
        branch: astriaTestModeIsOn ? "fast" : "sd15",
        token: "ohwx",
        image_urls: images,
        callback: trainWebhookWithParams,
        characteristics,
        prompts_attributes: [
          {
            text: `portrait of ohwx ${type} wearing a business suit, professional photo, white background, Amazing Details, Best Quality, Masterpiece, dramatic lighting highly detailed, analog photo, overglaze, 80mm Sigma f/1.4 or any ZEISS lens`,
            callback: promptWebhookWithParams,
            num_images: 8,
          },
          {
            text: `8k close up linkedin profile picture of ohwx ${type}, professional jack suite, professional headshots, photo-realistic, 4k, high-resolution image, workplace settings, upper body, modern outfit, professional suit, business, blurred background, glass building, office window`,
            callback: promptWebhookWithParams,
            num_images: 8,
          },
        ],
      },
    };

    const packBody = {
      tune: {
        title: name,
        name: type,
        callback: trainWebhookWithParams,
        characteristics,
        prompt_attributes: {
          callback: promptWebhookWithParams,
        },
        image_urls: images,
      },
    };

    const response = await axios.post(
      DOMAIN + (packsIsEnabled ? `/p/${pack}/tunes` : "/tunes"),
      packsIsEnabled ? packBody : tuneBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    if (response.status !== 201) {
      console.error("Training error status:", response.status);
      if (modelId) await supabase.from("models").delete().eq("id", modelId);

      const message = response.status === 400
        ? "webhookUrl must be a URL address"
        : response.status === 402
          ? "Training models is only available on paid plans."
          : "Something went wrong during training.";

      return NextResponse.json({ message }, { status: response.status });
    }

    const { error: samplesError } = await supabase.from("samples").insert(
      images.map((sample: string) => ({ modelId, uri: sample }))
    );

    if (samplesError) {
      console.error("samplesError:", samplesError);
      return NextResponse.json({ message: "Failed to save sample images." }, { status: 500 });
    }

    if (stripeIsConfigured && creditRow) {
      const newCreditCount = creditRow.credits - 1;

      const { error: updateError } = await supabase
        .from("credits")
        .update({ credits: newCreditCount })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating credits:", updateError);
        return NextResponse.json(
          { message: "Failed to deduct credits" },
          { status: 500 }
        );
      }
    }
  } catch (e) {
    console.error("Unexpected training error:", e);
    if (modelId) await supabase.from("models").delete().eq("id", modelId);
    return NextResponse.json({ message: "Training failed." }, { status: 500 });
  }

  return NextResponse.json({ message: "success" }, { status: 200 });
}
