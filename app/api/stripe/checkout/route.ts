// app/api/stripe/checkout/session/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

 // make sure your stripe package is up-to-date (≥18.0.0)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  const { priceId } = await req.json()
  const YOUR_DOMAIN = req.url.replace(/\/api.*/, '')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'link'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  })

  return NextResponse.json({ sessionId: session.id }); }