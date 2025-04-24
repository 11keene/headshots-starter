// app/api/stripe/checkout/session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', // matches your stripe@18.x
});

export async function POST(req: Request) {
  const { priceId } = await req.json();
  const YOUR_DOMAIN = req.url.replace(/\/api.*/, '');

  const params = {
    mode: 'payment',
    automatic_payment_methods: { enabled: true }, // cards, Apple Pay, Google Pay, Link, etc.
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  };
  const session = await stripe.checkout.sessions.create(params as any);

  return NextResponse.json({ sessionId: session.id });
}
