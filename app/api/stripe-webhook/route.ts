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
  } catch (err) {
    console.error("❌ [stripe-webhook] Signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // 🔁 Wrap all logic in try/catch to avoid crash
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

      // 🛡 Prevent duplicate job: check Redis lock
      const redisLockKey = `job_in_progress:${packId}`;
      const jobExists = await redis.get(redisLockKey);
      if (jobExists) {
        console.log(`ℹ️ [stripe-webhook] Duplicate job detected for packId ${packId}, skipping enqueue.`);
        return new NextResponse("Job already queued", { status: 200 });
      }

      // 🔒 Lock job for 2 hours using native Redis client
      await redis.set(redisLockKey, "true", { ex: 7200 });

      // 📨 Enqueue job
      const jobPayload = JSON.stringify({
        userId,
        packId,
        gender,
        packType,
        sessionId: session.id,
      });

      console.log("📬 [stripe-webhook] Enqueuing job to Redis (jobQueue):", jobPayload);

      const maxAttempts = 5;
      let attempt = 0;
      while (attempt < maxAttempts) {
        try {
          console.log(`📬 Attempting Redis enqueue (try #${attempt + 1})`);
          await redis.lpush("jobQueue", jobPayload);
          console.log("✅ [stripe-webhook] Job enqueued to Redis");
          break;
        } catch (err) {
          attempt++;
          console.error(`❌ Redis enqueue failed on try #${attempt}:`, err);
          if (attempt === maxAttempts) {
            return new NextResponse("Redis enqueue failed", { status: 500 });
          }
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt)); // exponential backoff
        }
      }
    } else {
      console.log("ℹ️ [stripe-webhook] Ignored event type:", event.type);
    }

    return new NextResponse("Received", { status: 200 });
  } catch (err) {
    console.error("❌ [stripe-webhook] Unhandled error in webhook logic:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
