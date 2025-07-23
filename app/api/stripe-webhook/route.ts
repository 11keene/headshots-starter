// File: app/api/stripe-webhook/route.ts
<<<<<<< HEAD

=======
>>>>>>> restore-working-version
import { NextResponse } from "next/server";
import Stripe from "stripe";
import redis from "@/lib/redisClient";

<<<<<<< HEAD
// 1️⃣ Tell Next.js to run this code in a real Node.js environment
export const runtime = "nodejs";

// 2️⃣ Initialize Stripe with your secret key and API version
=======
>>>>>>> restore-working-version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

<<<<<<< HEAD
export async function POST(req: Request) {
  console.log("🥁 [stripe-webhook] ENTERED webhook handler");

  // —————————————————————————————————————————————
  // STEP A: Read the raw text body and Stripe signature header
  // —————————————————————————————————————————————
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ [stripe-webhook] Missing Stripe signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  // —————————————————————————————————————————————
  // STEP B: Verify that this really came from Stripe
  // —————————————————————————————————————————————
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
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // —————————————————————————————————————————————
  // STEP C: Immediately send Stripe a 200 OK so it stops waiting
  // —————————————————————————————————————————————
  // We give Stripe this quick “I got it!” before we do anything slow.
  const immediateResponse = new NextResponse("Received", { status: 200 });

  // —————————————————————————————————————————————
  // STEP D: Offload the real work into an async “fire-and-forget” function
  // —————————————————————————————————————————————
  if (event.type === "checkout.session.completed") {
    (async () => {
      try {
        // 🎯 Grab the session object
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("🔔 [stripe-webhook] checkout.session.completed:", session.id);

        // 🗂️ Pull metadata fields that you attached when creating the Checkout Session
        const md       = session.metadata || {};
        const userId   = md.userId   || md.user_id;
        const packId   = md.packId   || md.pack_id;
        const gender   = md.gender;
        const packType = md.packType || md.pack_type;

        // 🚨 If any required metadata is missing, throw an error
        if (!userId || !packId || !gender) {
          throw new Error("Missing metadata fields");
        }

        // 🔑 Instead of touching Supabase here, we just push a JSON job into Redis
        const payload = JSON.stringify({
          userId,
          packId,
          gender,
          packType,
          sessionId: session.id,
        });
        await redis.lpush("jobQueue", payload);
        console.log("✅ [stripe-webhook] Job queued in Redis:", payload);

      } catch (err) {
        // If anything goes wrong, we log it—but Stripe has already got its 200 OK!
        console.error("❌ [stripe-webhook] Background processing failed:", err);
      }
    })();
  } else {
    console.log("ℹ️ [stripe-webhook] Ignoring event type:", event.type);
  }

  // 🔚 Send our quick reply back to Stripe
  return immediateResponse;
}

// Disallow GET requests to this endpoint
export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
=======
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
>>>>>>> restore-working-version
