// File: app/api/stripe/webhooks/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge"; // run on the edge for fastest webhook‐response

// — Initialize Stripe —
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// — Initialize Supabase Admin (service role) —
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // 1) Read the raw body & signature
  const buf = Buffer.from(await request.arrayBuffer());
  const sig = request.headers.get("stripe-signature")!;

  // 2) Verify & parse the Stripe event
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("❌ Stripe webhook signature mismatch:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3) Only handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session   = event.data.object as Stripe.Checkout.Session;
    const user_id   = session.metadata?.user_id   as string;
    const price_id  = session.metadata?.price_id  as string;
    const plan_name = session.metadata?.plan_name as string;

    if (user_id && price_id && plan_name) {
      // 4) Mark the Supabase order as paid and record which plan
      await supabaseAdmin
        .from("orders")
        .update({ status: "paid", price_id, plan_name })
        .eq("session_id", session.id);

      console.log(
        `✅ Order ${session.id} for user ${user_id} marked paid (plan: ${plan_name})`
      );
    }
  }

  // 5) Acknowledge receipt
  return NextResponse.json({ received: true });
}
