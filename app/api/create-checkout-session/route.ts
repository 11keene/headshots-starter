// File: app/api/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  // Explicitly type the expected JSON body to satisfy TS
  const { pack, user_id, extras } = (await req.json()) as {
    pack: string;
    user_id: string;
    extras?: string[];
  };

  // Map pack name to price ID
  const PRICE_MAP: Record<string, string> = {
    headshot: process.env.HEADSHOT_PRICE_ID!,
    action: process.env.ACTION_PRICE_ID!,
    // add other packs here if needed
  };

  const lineItems = [
    { price: PRICE_MAP[pack], quantity: 1 },
    ...(Array.isArray(extras)
      ? extras.map((priceId) => ({ price: priceId, quantity: 1 }))
      : []),
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    metadata: { user_id, pack },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/overview/packs/${pack}/generate?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?packId=${pack}`,
  });

  return NextResponse.json({ url: session.url });
}
