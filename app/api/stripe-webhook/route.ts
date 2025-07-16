// File: app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import redis from "@/lib/redisClient";
import { createClient } from "@supabase/supabase-js";

// 1) Ensure this runs in Node.js (so redis + supabase-js work)
export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  console.log("🥁 [stripe-webhook] ENTERED webhook handler");

  // 2) Grab the raw body & Stripe signature header
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ [stripe-webhook] Missing Stripe signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  // 3) Verify the signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ [stripe-webhook] Signature verified:", event.type);
  } catch (err: any) {
    console.error("❌ [stripe-webhook] Signature verification failed:", err.message);
    return new NextResponse(`Invalid signature: ${err.message}`, { status: 400 });
  }

  // 4) Handle the one event you care about
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("🔔 [stripe-webhook] checkout.session.completed:", session.id);

    const md = session.metadata || {};
    const userId  = md.userId  || md.user_id;
    const packId  = md.packId  || md.pack_id;
    const gender  = md.gender;
    const packType= md.packType|| md.pack_type;

    if (!userId || !packId || !gender) {
      console.error("❌ [stripe-webhook] Missing metadata:", md);
      return new NextResponse("Missing metadata fields", { status: 400 });
    }

    // → Dedupe in Postgres
    const { data: jobs, error: supaErr } = await supabase
      .from("generation_jobs")
      .select("id")
      .eq("session_id", session.id)
      .limit(1);
    if (supaErr) throw supaErr;
    if (jobs && jobs.length > 0) {
      console.log("⛔ [stripe-webhook] Duplicate session, skipping.");
      return new NextResponse("Duplicate session", { status: 200 });
    }

    // → Redis lock per packId
    const lockKey = `job_in_progress:${packId}`;
    if (await redis.get(lockKey)) {
      console.log(`ℹ️ [stripe-webhook] Already queued for ${packId}`);
      return new NextResponse("Already queued", { status: 200 });
    }
    await redis.set(lockKey, "1", { ex: 2 * 60 * 60 }); // 2h TTL

    // → Enqueue
    const payload = JSON.stringify({ userId, packId, gender, packType, sessionId: session.id });
    await redis.lpush("jobQueue", payload);
    console.log("✅ [stripe-webhook] Job queued:", payload);

    return new NextResponse("Job queued", { status: 200 });
  }

  // 5) All other events get a polite 200
  console.log("ℹ️ [stripe-webhook] Ignoring event type:", event.type);
  return new NextResponse("Ignored", { status: 200 });
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
