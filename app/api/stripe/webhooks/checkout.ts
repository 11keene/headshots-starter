// File: app/api/stripe/webhooks/checkout.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { buffer } from "micro";
import { createClient } from "@supabase/supabase-js";

// ① Stripe init
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// ② Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Disable Next.js body parsing so we can verify the raw payload
export const config = { api: { bodyParser: false } };

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({}, { status: 405 });
  }

  // 1) Grab the raw body & verify
  const sig = req.headers.get("stripe-signature")!;
  const buf = await buffer(req as any);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("🔔 Webhook received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const user_id = session.metadata?.user_id;
    const pack    = session.metadata?.pack;

    console.log("➡️ session.metadata:", session.metadata);

    if (user_id && pack) {
      // 2) Mark the order paid
      const { error: orderErr } = await supabaseAdmin
        .from("orders")
        .update({ status: "paid" })
        .eq("session_id", session.id);

      if (orderErr) {
        console.error("❌ Failed to update order status:", orderErr);
      } else {
        console.log("✅ Order marked as paid:", session.id);
      }

      // 3) Calculate credits
      const CREDIT_MAP: Record<string, number> = {
        price_1RJLBd4RnIZz7j08beYwRGv1:      25,
        price_1RJLCO4RnIZz7j08tJ3vN1or:      75,
        price_1RJLDE4RnIZz7j08RlQUve2s:     200,
        price_1RJLDf4RnIZz7j08TLcrNcQ6:     500,
      };
      const add = CREDIT_MAP[pack] || 0;
      console.log(`💳 Awarding ${add} credits to user ${user_id}`);

      // 4) Fetch current credits
      const { data: userRec, error: fetchErr } = await supabaseAdmin
        .from("users")
        .select("credits")
        .eq("id", user_id)
        .single();

      if (fetchErr) {
        console.error("❌ Failed to fetch user credits:", fetchErr);
      }

      const current = userRec?.credits ?? 0;
      console.log(`🔢 Current credits: ${current}, new total: ${current + add}`);

      // 5) Update credits
      const { data: updatedUser, error: updateErr } = await supabaseAdmin
        .from("users")
        .update({ credits: current + add })
        .eq("id", user_id)
        .select("credits");

      if (updateErr) {
        console.error("❌ Failed to update user credits:", updateErr);
      } else {
        console.log("✅ User credits updated:", updatedUser);
      }
    } else {
      console.warn("⚠️  Missing metadata.user_id or pack—skipping credits");
    }
  }

  return NextResponse.json({ received: true });
}
