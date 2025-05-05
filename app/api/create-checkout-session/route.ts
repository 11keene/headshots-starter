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
    console.log("✅ create-checkout-session body:", body);

    const { pack, user_id, extras } = body as {
      pack?: string;
      user_id?: string;
      extras?: string[];
    };

    // 2) Make sure we have pack & user_id
    if (!pack || !user_id) {
      console.error("❌ Missing pack or user_id");
      return NextResponse.json(
        { error: "pack and user_id are required" },
        { status: 400 }
      );
    }

    // 3) Build line items for Stripe
    const lineItems = [
      { price: pack, quantity: 1 },
      ...(Array.isArray(extras)
        ? extras.map((priceId) => ({ price: priceId, quantity: 1 }))
        : []),
    ];
    console.log("🛒 Stripe line items:", lineItems);

    // 4) Get our site’s origin for the redirect URLs
    const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    // 5) Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: { user_id, pack },
      success_url: `${origin}/overview/packs/${pack}/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?packId=${pack}`,
    });
    console.log("✅ Stripe session URL:", session.url);

    // 6) Insert a “pending” order into Supabase
    const { error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id,
        pack,
        session_id: session.id,
        status: "pending",
        amount: session.amount_total,             // total in cents
        created_at: new Date().toISOString(),
      });
    if (orderErr) {
      console.error("❌ Failed to insert order:", orderErr);
    }

    // 7) Send the session URL back to the client
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("🔥 create-checkout-session error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
