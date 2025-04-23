// app/api/stripe/checkout/session/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
})

export async function POST(req: Request) {
  const { priceId } = await req.json()
  const YOUR_DOMAIN = req.url.replace(/\/api.*/, '')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'], // Apple Pay will show automatically on Safari
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  })

  return NextResponse.json({ url: session.url })
}
