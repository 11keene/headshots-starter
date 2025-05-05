// File: app/api/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// — Initialize Stripe —
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// — Initialize Supabase Admin (service role) —
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1) Read & log what the client sent
    const body = await req.json();
    console.log("✅ [create-checkout] body:", body);

    const { pack, user_id, extras } = body as {
      pack?: string;
      user_id?: string;
      extras?: string[];
    };

    // 2) Validate
    if (!pack || !user_id) {
      console.error("❌ Missing pack or user_id");
      return NextResponse.json(
        { error: "pack and user_id are required" },
        { status: 400 }
      );
    }

    // 3) Build Stripe line items
    const lineItems = [
      { price: pack, quantity: 1 },
      ...(Array.isArray(extras)
        ? extras.map((priceId) => ({ price: priceId, quantity: 1 }))
        : []),
    ];
    console.log("🛒 [create-checkout] line items:", lineItems);

    // 4) Where to redirect back to
    const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    // 5) Create the Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: { user_id, pack },
      success_url: `${origin}/overview?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?packId=${pack}`,
    });
    console.log("✅ [create-checkout] created Stripe session:", session.id);

    // 6) Insert a “pending” order into Supabase and return the row
    const { data: insertedOrder, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id,
        pack,
        session_id: session.id,
        status: "pending",
        amount: session.amount_total, // make sure you have an `amount` column!
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderErr) {
      console.error("❌ [create-checkout] failed to insert order:", orderErr);
    } else {
      console.log("✅ [create-checkout] inserted order:", insertedOrder);
    }

    // 7) Send the Stripe session URL back to the front‐end
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("🔥 [create-checkout] unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
