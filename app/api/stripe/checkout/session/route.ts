// app/api/stripe/checkout/session/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Debug environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
}

// Safe environment variable access
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

// Create Stripe instance
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  try {
    // Parse JSON body
    let body: any;
    try {
      body = await req.json();
    } catch (e: any) {
      console.error("Failed to parse request body:", e);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { priceId } = body;
    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // On success, bring them back to your dashboard with the session ID
      success_url: `${req.headers.get('origin')}/overview?session_id={CHECKOUT_SESSION_ID}`,
      // On cancel, send them back to pack selection
      cancel_url: `${req.headers.get('origin')}/overview/packs`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout session error:", err);
    return NextResponse.json(
      { error: 'Unable to create checkout session' },
      { status: 500 }
    );
  }
}
