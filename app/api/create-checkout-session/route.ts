// File: app/api/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  try {
    // 1) Parse and log the incoming JSON body
    const body = await req.json();
    console.log("✅ create-checkout-session body:", body);

    const { pack, user_id, extras } = body as {
      pack?: string;
      user_id?: string;
      extras?: string[];
    };

    // 2) Validate required fields
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
    console.log("🛒 Stripe line items:", lineItems);

    // 4) Determine origin for redirect URLs
    const origin = headers().get("origin") ?? "";

    // 5) Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: { user_id, pack },
      success_url: `${origin}/overview/packs/${pack}/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?packId=${pack}`,
    });
    console.log("✅ Stripe session URL:", session.url);

    // 6) Return the session URL to the client
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // 7) Catch and log any errors
    console.error("🔥 create-checkout-session error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
