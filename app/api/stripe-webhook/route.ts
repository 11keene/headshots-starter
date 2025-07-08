// File: app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import redis from "@/lib/redisClient";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  console.log("🥁 [stripe-webhook] ENTERED webhook handler");

  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ [stripe-webhook] Missing Stripe signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
  event = stripe.webhooks.constructEvent(
  rawBody,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET!
);
console.log("✅ [stripe-webhook] Signature verified:", event.type);

// ✅ Skip old Stripe events (older than 30 min)
const createdSeconds = event.created;
const ageInSeconds = Math.floor(Date.now() / 1000) - createdSeconds;
if (ageInSeconds > 1800) {
  console.warn(`⏩ [stripe-webhook] Ignoring old Stripe event (${ageInSeconds}s old)`);
  return new NextResponse("Event too old, ignored", { status: 200 });
}

  } catch (err) {
    console.error("❌ [stripe-webhook] Signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
   if (event.type === "checkout.session.completed") {
  const session = event.data.object as Stripe.Checkout.Session;
  console.log("🔔 [stripe-webhook] checkout.session.completed for session:", session.id);

  const md = session.metadata || {};
  const userId = md.userId || md.user_id;
  const packId = md.packId || md.pack_id;
  const gender = md.gender;
  const packType = md.packType || md.pack_type;

  console.log("📦 [stripe-webhook] Parsed metadata:", { userId, packId, gender, packType });

  if (!userId || !packId || !gender) {
    console.error("❌ [stripe-webhook] Missing metadata fields");
    return new NextResponse("Missing metadata", { status: 400 });
  }

  // ✅ NEW: Check if this session has already created a job
  const { data: existingJob, error } = await supabase
    .from("generation_jobs")
    .select("id")
    .eq("session_id", session.id)
    .limit(1);

  if (existingJob && existingJob.length > 0) {
    console.log("⛔ [stripe-webhook] Job already exists for this Stripe session. Skipping duplicate.");
    return new NextResponse("Duplicate session, job already created", { status: 200 });
  }

  // ✅ Lock by packId
  const redisLockKey = `job_in_progress:${packId}`;
  const alreadyQueued = await redis.get(redisLockKey);
  if (alreadyQueued) {
    console.log(`ℹ️ [stripe-webhook] Redis lock already exists for ${packId}, skipping enqueue.`);
    return new NextResponse("Job already queued", { status: 200 });
  }

  // Lock BEFORE enqueue
  await redis.set(redisLockKey, "true", { ex: 7200 });
  console.log(`🔒 [stripe-webhook] Lock set for ${packId}`);

  const jobPayload = JSON.stringify({
    userId,
    packId,
    gender,
    packType,
    sessionId: session.id, // this will be saved in worker
  });

  console.log("📬 [stripe-webhook] Enqueuing job to Redis (jobQueue):", jobPayload);
  await redis.lpush("jobQueue", jobPayload);
  console.log("✅ [stripe-webhook] Job enqueued to Redis");

  return new NextResponse("Job queued", { status: 200 });
}


    // Not a type we care about
    console.log("ℹ️ [stripe-webhook] Ignored event type:", event.type);
    return new NextResponse("Ignored event", { status: 200 });
  } catch (err) {
    console.error("❌ [stripe-webhook] Unhandled error in webhook logic:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
