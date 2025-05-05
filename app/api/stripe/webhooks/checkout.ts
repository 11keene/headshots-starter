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
  if (req.method !== "POST") return NextResponse.json({}, { status: 405 });

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
    console.error("❌ Stripe webhook signature check failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Only handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const user_id = session.metadata?.user_id;
    const pack    = session.metadata?.pack;

    if (user_id && pack) {
      // 1) Mark order as paid
      await supabaseAdmin
        .from("orders")
        .update({ status: "paid" })
        .eq("session_id", session.id);

      // 2) Determine credits for this pack
      const CREDIT_MAP: Record<string, number> = {
        price_1RJLBd4RnIZz7j08beYwRGv1: 25,
        price_1RJLCO4RnIZz7j08tJ3vN1or: 75,
        price_1RJLDE4RnIZz7j08RlQUve2s: 200,
        price_1RJLDf4RnIZz7j08TLcrNcQ6: 500,
      };
      const add = CREDIT_MAP[pack] || 0;

      // 3) Increment user’s credits
      const { data: userRec } = await supabaseAdmin
        .from("users")
        .select("credits")
        .eq("id", user_id)
        .single();
      const current = userRec?.credits ?? 0;

      await supabaseAdmin
        .from("users")
        .update({ credits: current + add })
        .eq("id", user_id);
    }
  }

  return NextResponse.json({ received: true });
}
