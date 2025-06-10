// File: app/api/stripe-webhook/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import redis from "@/lib/redisClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export const config = {
  api: { bodyParser: false }, // Stripe requires raw body for signature verification
};

export async function POST(req: Request) {
  console.log("🥁 [stripe-webhook] ENTERED webhook handler");

  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ [Stripe Webhook] No Stripe signature header found.");
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ [Stripe Webhook] Signature verified. Event:", event.type);
  } catch (err) {
    console.error("❌ [Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const userId = metadata.user_id;
    const packId = metadata.packId;
    const gender = metadata.gender;
    const packType = metadata.packType;

    if (!userId || !packId || !gender) {
      console.error("❌ [Stripe Webhook] Missing metadata: userId, packId, or gender");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const job = JSON.stringify({ userId, packId, gender, packType, sessionId: session.id });

    try {
      await redis.lpush("jobQueue", job);
      console.log("📬 Job enqueued to Redis:", job);
    } catch (err) {
      console.error("❌ Failed to enqueue job to Redis:", err);
      return NextResponse.json({ error: "Redis enqueue failed" }, { status: 500 });
    }
  } else {
    console.log("ℹ️ [Stripe Webhook] Ignored event type:", event.type);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
