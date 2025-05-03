// File: app/api/stripe/checkout/order/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  try {
    // Parse and type the incoming JSON body
    const { priceIds, successUrl, cancelUrl } = (await req.json()) as {
      priceIds: string[];
      successUrl: string;
      cancelUrl: string;
    };

    if (!Array.isArray(priceIds) || priceIds.length === 0) {
      return NextResponse.json({ error: "priceIds required" }, { status: 400 });
    }

    // Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: priceIds.map((id) => ({ price: id, quantity: 1 })),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("❌ Error creating checkout session:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
