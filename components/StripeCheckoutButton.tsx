'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

// 7a) Initialize Stripe.js with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function StripeCheckoutButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)

    // 7b) Call your server to create the session
    const res = await fetch('/api/stripe/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    const { id } = await res.json()   // ← gets back { id: 'cs_…' }

    // 7c) Redirect to Stripe’s hosted Checkout page
    const stripe = await stripePromise
    if (stripe && id) {
      await stripe.redirectToCheckout({ sessionId: id })
    }

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
