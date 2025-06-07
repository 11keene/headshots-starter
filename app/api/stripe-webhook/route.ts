// File: app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export const config = {
  api: { bodyParser: false },
};

async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    if (value) chunks.push(value);
    done = doneReading;
  }

  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const rawBody = await buffer(req.body as any);
  const signature = req.headers.get("stripe-signature")!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    console.log("✅ [Stripe Webhook] Signature verified. Event:", event.type);
  } catch (err: any) {
    console.error("❌ [Stripe Webhook] Signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const userId = metadata.user_id;
    const packId = metadata.packId;

    if (!userId || !packId) {
      console.error("❌ Missing metadata: user_id or packId");
      return new NextResponse("Missing metadata", { status: 400 });
    }

    console.log("📦 [Webhook] Starting background job…", { userId, packId });

    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/run-background-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    });
  }

  return NextResponse.json({ received: true });
}
