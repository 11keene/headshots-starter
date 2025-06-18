// File: app/api/stripe/checkout/order/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(request: Request) {
  // 1) Parse & validate the incoming body
  const {
    priceIds,
    user_id,
    user_email,
    successUrl,
    cancelUrl,
  } = (await request.json()) as {
    priceIds:   string[];
    user_id?:   string;
    user_email?:string;
    successUrl: string;
    cancelUrl:  string;
  };

  if (
    !Array.isArray(priceIds) ||
    priceIds.length === 0 ||
    !user_id ||
    !user_email
  ) {
    return NextResponse.json(
      { error: "priceIds, user_id and user_email are all required" },
      { status: 400 }
    );
  }

  // 2) Create the Stripe Checkout session **with** client_reference_id
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items:           priceIds.map((id) => ({ price: id, quantity: 1 })),
    mode:                 "payment",

    // ← this ties the Checkout Session back to your Supabase user
    client_reference_id:  user_id,
    metadata:             { user_email },
  
    allow_promotion_codes: true, // add this line

    success_url: successUrl,
    cancel_url:  cancelUrl,
  });

  // 3) Return the URL to redirect the browser
  return NextResponse.json({ url: session.url });
}
