// components/StripeCheckoutButton.tsx
"use client"

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'

console.log('🔑 Loaded publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)


const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function StripeCheckoutButton({ priceId }: { priceId: string }) {
  useEffect(() => {
    stripePromise.then(stripe => {
      console.log('🧩 stripePromise resolved to:', stripe)
    })
  }, [])
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    console.log('🚀 Starting checkout for priceId:', priceId)
    setLoading(true)
    console.log('🚀 [Checkout] priceId →', priceId)
    const res = await fetch('/api/stripe/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    const { id } = await res.json()
    console.log('✅ Received session id:', id)
    const stripe = await stripePromise
    if (stripe && id) {
     // show the key Stripe.js is using
    // @ts-ignore
    console.log('🔑 [Checkout] using publishable key →', stripe._apiKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    await stripe.redirectToCheckout({ sessionId: id })
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-6 py-3 bg-dusty-coral text-white rounded hover:bg-dusty-coral/90 transition"
    >
      {loading ? 'Loading…' : 'Buy with Card or Apple Pay'}
    </button>
  )
}
