// File: app/api/generating/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-05-28.basil" });

// Helper: wait until 4 uploads are in Supabase
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

  // Step 1: Confirm Stripe payment
  const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ["payment_intent"] });
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }
  if (session.metadata?.packId !== packId) {
    return NextResponse.json({ error: "packId mismatch" }, { status: 400 });
  }

  // Step 2: Get intake gender
  const { data: packRow, error: packErr } = await supabase
    .from("packs")
    .select("intake")
    .eq("id", packId)
    .single();
  if (packErr || !packRow) {
    return NextResponse.json({ error: "Could not find pack/intake" }, { status: 500 });
  }
  const gender = (packRow.intake?.gender as string) || "woman";

  // Step 3: Wait for uploads to be ready
  let imageUrls: string[];
  try {
    imageUrls = await waitForUploads(supabase, packId);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  // Step 4: Create Astria Tune
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

  // Step 5: Generate prompts
  const promptRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-prompts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packId }),
  });
  const { prompts } = await promptRes.json();
  if (!Array.isArray(prompts)) {
    return NextResponse.json({ error: "Prompt generation failed" }, { status: 500 });
  }

  // Step 6: Send prompts to Astria & wait for images
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
    if (!promptId) continue;

    // Step 6b: Wait for 3 images to be returned for this prompt
    let imageUrls: string[] = [];
    for (let i = 0; i < 20; i++) {
      const statusRes = await fetch(`https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`, {
        headers: { Authorization: `Bearer ${process.env.ASTRIA_API_KEY}` },
      });
      const statusData = await statusRes.json();
      if (statusData?.images?.length === 3) {
        imageUrls = statusData.images;
        break;
      }
      await new Promise((r) => setTimeout(r, 3000)); // wait 3s
    }

    if (imageUrls.length !== 3) {
      console.warn(`⚠️ Only got ${imageUrls.length} images for prompt ${promptId}`);
      continue;
    }

    // Step 6c: Insert each image into Supabase
    for (const imageUrl of imageUrls) {
      await supabase.from("generated_images").insert({
        prompt_id: promptId,
        pack_id: packId,
        image_url: imageUrl,
        url: `https://api.astria.ai/tunes/${tuneId}/prompts/${promptId}.json`,
        created_at: new Date().toISOString(),
      });
    }
  }

  // ✅ Final Check: Log image count and trigger GHL email if ready
  const { data: uploadedImages, error: imageErr } = await supabase
    .from("generated_images")
    .select("image_url")
    .eq("pack_id", packId);

  if (imageErr) {
    console.error("[Final Check] Error fetching image count:", imageErr);
  } else if (uploadedImages.length === 45) {
    console.log(`✅ All 45 images uploaded to Supabase for pack ${packId}`);
    console.log("✅ Triggering GHL email...");

    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-ready-email-ghl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: session.customer_email,
        firstName: "",
        lastName: "",
        packId,
      }),
    });
  } else {
    console.warn(`⚠️ Only ${uploadedImages.length} images uploaded to Supabase for pack ${packId}`);
  }

  return NextResponse.json({ success: true });
}
