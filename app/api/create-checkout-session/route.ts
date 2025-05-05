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
    // 1) Parse the client payload
    const { pack, user_id, extras } = (await req.json()) as {
      pack?: string;
      user_id?: string;
      extras?: string[];
    };

    // 2) Validate required fields
    if (!pack || !user_id) {
      return NextResponse.json(
        { error: "pack and user_id are required" },
        { status: 400 }
      );
    }

    // 3) Upsert the user into your users table
    //    If they already exist, nothing changes; if not, we create them with 0 credits.
    const { error: userErr } = await supabaseAdmin
      .from("users")
      .upsert(
        { id: user_id, credits: 0 },
        { onConflict: "id", ignoreDuplicates: false }
      );
    if (userErr) {
      console.error("❌ Failed to upsert user:", userErr);
      // We can continue even if this fails, but your FK will be happy if it succeeds.
    }

    // 4) Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: pack, quantity: 1 },
      ...(Array.isArray(extras)
        ? extras.map((priceId) => ({ price: priceId, quantity: 1 }))
        : []),
    ];

    // 5) Create the Stripe Checkout session
    const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: { user_id, pack },
      success_url: `${origin}/overview/packs/${pack}/generate?packId=${pack}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?packId=${pack}`,
    });

    // 6) Insert the “pending” order (now safe from FK errors)
    const { error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id,
        pack,
        session_id: session.id,
        status: "pending",
        created_at: new Date().toISOString(),
      });
    if (orderErr) console.error("❌ Failed to insert order:", orderErr);

    // 7) Return the Stripe redirect URL
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("🔥 create-checkout-session error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
