// components/StripeCheckoutButton.tsx
"use client"

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function StripeCheckoutButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    const { url } = await res.json()
    const stripe = await stripePromise
    if (stripe && url) stripe.redirectToCheckout({ sessionId: new URL(url).searchParams.get('session_id')! })
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      {loading ? 'Loading…' : 'Buy with Card or Apple Pay'}
    </button>
  )
}
