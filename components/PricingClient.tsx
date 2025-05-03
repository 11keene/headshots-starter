// File: app/api/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  try {
    // 1) Parse & log the incoming body
    const body = await req.json();
    console.log("✅ create-checkout-session body:", body);

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

    // 3) Build your line items array
    const lineItems = [pack, ...(Array.isArray(extras) ? extras : [])].map(
      (priceId) => ({ price: priceId, quantity: 1 })
    );
    console.log("🛒 Stripe line items:", lineItems);

    // 4) Create a Stripe Checkout Session
    const origin = headers().get("origin") || "";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: { user_id },
      success_url: `${origin}/overview/packs/${pack}/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?packId=${pack}`,
    });
    console.log("✅ Stripe session URL:", session.url);

    // 5) Return the URL for the client to redirect
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // 6) Catch & log any errors
    console.error("🔥 create-checkout-session error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
