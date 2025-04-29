// app/astria/train-model/route.ts
import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!;
const TEST_MODE = process.env.ASTRIA_TEST_MODE === "true";
const PACKS_ENABLED = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";
const WEBHOOK_SECRET = process.env.APP_WEBHOOK_SECRET!;
const STRIPE = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

// guard against missing secrets
if (!WEBHOOK_SECRET) {
  throw new Error("Missing APP_WEBHOOK_SECRET env var");
}
if (!ASTRIA_API_KEY) {
  throw new Error("Missing ASTRIA_API_KEY env var");
}

export async function POST(request: Request) {
  // 1) parse the incoming JSON
  const { urls: images, type, pack, name, characteristics } =
    await request.json();

  // 2) verify user via Supabase
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // 3) basic validations
  if (!Array.isArray(images) || images.length < 4) {
    return NextResponse.json(
      { message: "Please upload at least 4 sample images." },
      { status: 400 }
    );
  }

  // 4) (optional) check & deduct a credit
  let creditRow: { credits: number } | null = null;
  if (STRIPE) {
    const { data, error } = await supabase
      .from("credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();
    if (error || !data) {
      return NextResponse.json(
        { message: "Unable to verify credits." },
        { status: 500 }
      );
    }
    if (data.credits < 1) {
      return NextResponse.json(
        { message: "Not enough credits. Please purchase more." },
        { status: 402 }
      );
    }
    creditRow = data;
  }

  // 5) create a new model record in your DB
  const { data: modelData, error: modelErr } = await supabase
    .from("models")
    .insert({ user_id: user.id, name, type })
    .select("id")
    .single();
  if (modelErr || !modelData) {
    return NextResponse.json(
      { message: "Failed to create model record." },
      { status: 500 }
    );
  }
  const modelId = modelData.id;

  try {
    // 6) build your Astria webhook URLs
    const base = process.env.DEPLOYMENT_URL
      ? `https://${process.env.DEPLOYMENT_URL.replace(/^https?:\/\//, "")}`
      : "";
    const trainCb = `${base}/astria/train-webhook?user_id=${user.id}&model_id=${modelId}&webhook_secret=${WEBHOOK_SECRET}`;
    const promptCb = `${base}/astria/prompt-webhook?user_id=${user.id}&model_id=${modelId}&webhook_secret=${WEBHOOK_SECRET}`;

    // 7) choose the right request body shape
    const tunePayload = PACKS_ENABLED
      ? {
          tune: {
            title: name,
            name: type,
            image_urls: images,
            callback: trainCb,
            characteristics,
            prompt_attributes: { callback: promptCb },
          },
        }
      : {
          tune: {
            title: name,
            base_tune_id: 690204,
            name: type,
            branch: TEST_MODE ? "fast" : "sd15",
            image_urls: images,
            callback: trainCb,
            characteristics,
            prompts_attributes: [
              {
                text: `portrait of ohwx ${type} wearing a business suit…`,
                callback: promptCb,
                num_images: 8,
              },
              {
                text: `8k close up linkedin profile picture of ohwx ${type}…`,
                callback: promptCb,
                num_images: 8,
              },
            ],
          },
        };

    // 8) actually call Astria
    const domain = "https://api.astria.ai";
    const endpoint = PACKS_ENABLED ? `/p/${pack}/tunes` : "/tunes";
    const res = await axios.post(domain + endpoint, tunePayload, {
      headers: {
        Authorization: `Bearer ${ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status !== 201) {
      // rollback on failure
      await supabase.from("models").delete().eq("id", modelId);
      return NextResponse.json(
        { message: "Astria returned an error." },
        { status: res.status }
      );
    }

    // 9) store the sample URLs
    await supabase
      .from("samples")
      .insert(images.map((uri: string) => ({ modelId, uri })));

    // 10) deduct that credit
    if (STRIPE && creditRow) {
      await supabase
        .from("credits")
        .update({ credits: creditRow.credits - 1 })
        .eq("user_id", user.id);
    }
  } catch (e) {
    console.error("🛑 Astria training failed:", e);
    // cleanup
    await supabase.from("models").delete().eq("id", modelId);
    return NextResponse.json(
      { message: "Training request failed." },
      { status: 500 }
    );
  }

  // 11) success!
  return NextResponse.json({ message: "Training started" }, { status: 200 });
}
