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
    const session = event.data.object as Stripe.Checkout.Session;
    const user_id = session.metadata?.user_id as string;
    const pack     = session.metadata?.pack as string;

    if (user_id && pack) {
      // 4) Mark the Supabase order as paid
      await supabaseAdmin
        .from("orders")
        .update({ status: "paid" })
        .eq("session_id", session.id);
        

      // 5) Map your Price IDs → credit amounts
      const CREDIT_MAP: Record<string, number> = {
        price_1RJLBd4RnIZz7j08beYwRGv1:  25,
        price_1RJLCO4RnIZz7j08tJ3vN1or:  75,
        price_1RJLDE4RnIZz7j08RlQUve2s: 200,
        price_1RJLDf4RnIZz7j08TLcrNcQ6: 500,
      };
      const toAdd = CREDIT_MAP[pack] || 0;

      if (toAdd > 0) {
        // 6) Increment the user's total credits
        await supabaseAdmin
          .from("users")
          .update({ credits: { increment: toAdd } })
          .eq("id", user_id);

        // 7) Log the credit‐grant in your credits history table
        await supabaseAdmin
          .from("credits")
          .insert({ user_id, credits: toAdd });

        console.log(`✅ Credited ${toAdd} to user ${user_id}`);
      }
    }
  }

  // 8) Acknowledge receipt
  return NextResponse.json({ received: true });
}
