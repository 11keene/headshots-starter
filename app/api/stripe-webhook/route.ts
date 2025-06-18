// File: app/api/stripe-webhook/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import redis from "@/lib/redisClient";



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  console.log("🥁 [stripe-webhook] ENTERED webhook handler");

  const rawBody = await req.text();
  const sig     = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ Missing Stripe signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ [Stripe Webhook] Signature verified:", event.type);
  } catch (err) {
    console.error("❌ Signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const md      = session.metadata || {};
    const userId  = md.userId   || md.user_id;
    const packId  = md.packId   || md.pack_id;
    const gender  = md.gender;
    const packType= md.packType || md.pack_type;

    console.log("📦 [Webhook] Parsed metadata:", { userId, packId, gender, packType });

    if (!userId || !packId || !gender) {
      console.error("❌ Missing metadata fields");
      return new NextResponse("Missing metadata", { status: 400 });
    }

    const job = JSON.stringify({ userId, packId, gender, packType, sessionId: session.id });
    try {
      console.log("📦 Pushing job to Redis:", job);
      await redis.lpush("jobQueue", job);
      console.log("📬 Job enqueued to Redis");
    } catch (err) {
      console.error("❌ Redis enqueue failed:", err);
      return new NextResponse("Redis enqueue failed", { status: 500 });
    }
  } else {
    console.log("ℹ️ [Stripe Webhook] Ignored event type:", event.type);
  }

  return new NextResponse("Received", { status: 200 });
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
