// app/api/stripe/checkout/session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { Stripe as StripeNamespace } from 'stripe'
type SessionCreateParams = StripeNamespace.Checkout.SessionCreateParams
 // make sure your stripe package is up-to-date (≥18.0.0)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',  // must match your installed stripe@18.x
});

export async function POST(req: Request) {
  const { priceId } = await req.json()
  const YOUR_DOMAIN = req.url.replace(/\/api.*/, '')

  const params: Stripe.Checkout.SessionCreateParams = {    
    mode: 'payment',
      payment_method_types: ['card', 'link'],    // Option A: list card & Link
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    };
    const session = await stripe.checkout.sessions.create(params);

  return NextResponse.json({ sessionId: session.id }); }