// File: app/api/stripe/webhooks/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// — Initialize Stripe —
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// — Initialize Supabase Admin —
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Map Stripe Price IDs → credit amounts
const CREDITS_MAP: Record<string, number> = {
  price_1RJLBd4RnIZz7j08beYwRGv1:  25,
  price_1RJLCO4RnIZz7j08tJ3vN1or:  75,
  price_1RJLDE4RnIZz7j08RlQUve2s: 200,
  price_1RJLDf4RnIZz7j08TLcrNcQ6: 500,
};

export async function POST(request: Request) {
  // 1) Verify signature + parse event
  const buf = Buffer.from(await request.arrayBuffer());
  const sig = request.headers.get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log("🔐 Signature verified. Event:", event.type);
  } catch (err: any) {
    console.error("❌ Signature mismatch:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    console.log("🎉 checkout.session.completed");
    const session = event.data.object as Stripe.Checkout.Session;

    // 2) Grab the user reference
    const userId = session.client_reference_id!;
    if (!userId) {
      console.error("⚠️ Missing client_reference_id!");
      return NextResponse.json({ error: "No user ID" }, { status: 400 });
    }

    // 3) Mark the Supabase order as paid
    await supabaseAdmin
      .from("orders")
      .update({ status: "paid" })
      .eq("session_id", session.id);

    // 4) Fetch line items
    let items: Stripe.LineItem[];
    try {
      const resp = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 10,
      });
      items = resp.data;
    } catch (err) {
      console.error("❌ Failed to list line items:", err);
      return NextResponse.json(
        { error: "Failed to list line items" },
        { status: 500 }
      );
    }

    // 5) Sum credits via your map
    let totalCredits = 0;
    for (const item of items) {
      const priceId = item.price!.id;
      const qty     = item.quantity ?? 1;
      totalCredits += (CREDITS_MAP[priceId] || 0) * qty;
    }
    console.log(`🔖 Calculated credits to add: ${totalCredits}`);

    if (totalCredits > 0) {
      // 6a) Read current user credits
      const { data: userRow, error: fetchErr } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', userId)
      .maybeSingle()
  
    if (fetchErr || !userRow) {
      console.error('⚠️ Could not fetch existing credits:', fetchErr)
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 500 }
        );
      }

      // 6b) Update user credits
      const newTotal = (userRow.credits || 0) + totalCredits;
      const { error: updateErr } = await supabaseAdmin
        .from("users")
        .update({ credits: newTotal })
        .eq("id", userId);
      if (updateErr) {
        console.error("❌ Failed to update user credits:", updateErr);
        return NextResponse.json(
          { error: "Credit update failed" },
          { status: 500 }
        );
      }
      console.log(`✅ Added ${totalCredits} credits; user now at ${newTotal}`);

      // 7) Log in history
      await supabaseAdmin
        .from("credits")
        .insert({ user_id: userId, credits: totalCredits });
      console.log("🗒️ Logged credit grant");
    }
  }

  // 8) Always ACK
  return NextResponse.json({ received: true });
}
