"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const priceId = searchParams.get("priceId");

  useEffect(() => {
    async function maybeCheckout() {
      if (!priceId) return;
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
      if (stripe) {
        await stripe.redirectToCheckout({
          mode: "payment",
          lineItems: [{ price: priceId, quantity: 1 }],
          successUrl: window.location.origin + "/overview",
          cancelUrl: window.location.origin + "/pricing",
        });
      }
    }
    maybeCheckout();
  }, [priceId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* ——— Your existing login form markup goes here ——— */}
      {/* e.g.: <LoginForm /> or your custom JSX */}
    </div>
  );
}
