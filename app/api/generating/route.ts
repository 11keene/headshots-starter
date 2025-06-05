// File: app/api/generating/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-05-28.basil" });

// same waitForUploads helper you already have…
async function waitForUploads(supabase: any, packId: string, maxAttempts = 5, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data: uploads, error } = await supabase
      .from("uploads")
      .select("url")
      .eq("pack_id", packId);

    if (error) throw error;
    if (uploads && uploads.length >= 4) {
      return uploads.map((u: { url: string }) => u.url);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("No uploaded images found for pack " + packId);
}

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);
  const session_id = url.searchParams.get("session_id");
  const packId = url.searchParams.get("packId");
  if (!session_id || !packId) {
    return NextResponse.json({ error: "Missing session_id or packId" }, { status: 400 });
  }

  // 1) Verify Stripe session
  const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ["payment_intent"] });
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }
  if (session.metadata?.packId !== packId) {
    return NextResponse.json({ error: "packId mismatch" }, { status: 400 });
  }

  // 2) Fetch intake to get gender
  const { data: packRow, error: packErr } = await supabase
    .from("packs")
    .select("intake")
    .eq("id", packId)
    .single();
  if (packErr || !packRow) {
    return NextResponse.json({ error: "Could not find pack/intake" }, { status: 500 });
  }
  const gender = (packRow.intake?.gender as string) || "woman";

  // 3) Wait for at least 4 uploads to appear
  let imageUrls: string[];
  try {
    imageUrls = await waitForUploads(supabase, packId);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  // 4) Create Astria tune
  const tuneForm = new FormData();
  tuneForm.append("tune[title]", `${session.metadata.user_id}-${packId}`);
  tuneForm.append("tune[name]", gender);
  tuneForm.append("tune[branch]", "fast");
  imageUrls.forEach((url) => tuneForm.append("tune[images][]", url));

  const tuneRes = await fetch("https://api.astria.ai/tunes", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` },
    body: tuneForm,
  });
  const tuneData = await tuneRes.json();
  const tuneId = tuneData?.id;
  if (!tuneId) {
    return NextResponse.json({ error: "Tune creation failed" }, { status: 500 });
  }

  // 5) Generate GPT prompts (re‐use your existing /api/generate-prompts)
  const promptRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-prompts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packId }),
  });
  const { prompts } = await promptRes.json();
  if (!Array.isArray(prompts)) {
    return NextResponse.json({ error: "Prompt generation failed" }, { status: 500 });
  }

  // 6) Send each prompt to Astria
  for (const promptText of prompts) {
    const astriaPrompt = `sks ${gender} ${promptText}`;
    const sendRes = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: astriaPrompt,
        num_images: 3,
        super_resolution: true,
        inpaint_faces: true,
        width: 896,
        height: 1152,
        sampler: "euler_a",
      }),
    });
    const sendData = await sendRes.json();
    const promptId = sendData?.id;
    if (promptId) {
      await supabase.from("generated_images").insert({
        prompt_id: promptId,
        pack_id: packId,
        image_url: "",
        url: `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
        created_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ success: true });
}
