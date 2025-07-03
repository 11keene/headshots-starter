// File: app/api/stripe-webhook/route.ts    ← rename from `.route.tss` if needed
import { NextResponse } from "next/server";
import Stripe from "stripe";
import redis from "@/lib/redisClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  console.log("🥁 [stripe-webhook] ENTERED webhook handler");                      // ← (1) ENTRY LOG

  const rawBody = await req.text();
  const sig     = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("❌ [stripe-webhook] Missing Stripe signature header");          // ← (2) ERROR LOG
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ [stripe-webhook] Signature verified:", event.type);            // ← (3) SUCCESS LOG
  } catch (err) {
    console.error("❌ [stripe-webhook] Signature verification failed:", err);      // ← (4) FAIL LOG
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("🔔 [stripe-webhook] checkout.session.completed for session:", session.id); // ← (5) SESSION LOG

    const md      = session.metadata || {};
    const userId  = md.userId   || md.user_id;
    const packId  = md.packId   || md.pack_id;
    const gender  = md.gender;
    const packType= md.packType || md.pack_type;

    console.log("📦 [stripe-webhook] Parsed metadata:", { userId, packId, gender, packType }); // ← (6)

    if (!userId || !packId || !gender) {
      console.error("❌ [stripe-webhook] Missing metadata fields");                  // ← (7)
      return new NextResponse("Missing metadata", { status: 400 });
    }

    // ─── 3️⃣ STEP 3: ENQUEUE JOB INTO REDIS ─────────────────────────────
    const jobPayload = JSON.stringify({
      userId,
      packId,
      gender,
      packType,
      sessionId: session.id,
    });

    console.log(
      `📬 [stripe-webhook] Enqueuing job to Redis (“jobQueue”):`,
      jobPayload
    );
    await redis.lpush("jobQueue", jobPayload);
    console.log("✅ [stripe-webhook] Job successfully enqueued");    
    // ───────────── Optional retry wrapper ─────────────
    const maxAttempts = 5;
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        console.log(`📬 [stripe-webhook] Attempting Redis enqueue (try #${attempt + 1}):`, jobPayload);
        await redis.lpush("jobQueue", jobPayload);
        console.log("✅ [stripe-webhook] Job enqueued to Redis");
        break;
      } catch (err) {
        attempt++;
        console.error(`❌ [stripe-webhook] Redis enqueue failed on try #${attempt}:`, err);
        if (attempt === maxAttempts) {
          return new NextResponse("Redis enqueue failed", { status: 500 });
        }
        // exponential backoff
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }

  } else {
    console.log("ℹ️ [stripe-webhook] Ignored event type:", event.type);            // ← (8)
  }

  return new NextResponse("Received", { status: 200 });
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
