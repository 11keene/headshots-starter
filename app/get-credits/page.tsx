// File: app/get-credits/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Card } from "@/components/ui/card";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Plan = {
  id: string;
  name: string;
  description: string;
  price: string;         // now a string price, not credits
  priceId: string;
};

const PLANS: Plan[] = [
  {
    id:          "starter",
    priceId:     "price_1ROLak4RnIZz7j08sUmtURum",
    name:        "Starter Pack",
    description: "6 Prompts • 18 Images • 6 Unique Outfits • 6 Unique Backgrounds",
    price:       "$29.99",
  },
  // …themed, custom …
];

export default function PricingPage() {
  const supabase = createPagesBrowserClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan|null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id });
    });
  }, [supabase]);

  const handleCheckout = async (plan: Plan) => {
    if (!user) {
      setError("You must be logged in to purchase.");
      return;
    }
    setLoading(true);
    setError("");

    // hit your own API which creates a Stripe Session
    const { sessionId, url, error: err } = await fetch("/api/stripe/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId:  plan.priceId,
        planName: plan.name,
        user_id:  user.id,
      }),
    }).then(r => r.json());

    if (err || !sessionId) {
      setError(err || "Failed to start checkout");
      setLoading(false);
      return;
    }

    const stripe = await stripePromise;
    if (!stripe) {
      setError("Stripe.js failed to load");
      setLoading(false);
      return;
    }

    await stripe.redirectToCheckout({ sessionId });
  };

  return (
    <div className="min-h-screen bg-ivory p-8">
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <h1 className="text-3xl font-bold mb-6">Pick Your Pack</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map(plan => (
          <Card
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`p-6 cursor-pointer border-2 transition ${
              selectedPlan?.id === plan.id ? "border-dusty-coral" : "border-warm-gray"
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <p className="text-4xl font-extrabold text-dusty-coral">{plan.price}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-right">
        <Button
          onClick={() => selectedPlan && handleCheckout(selectedPlan)}
          disabled={!selectedPlan || loading}
        >
          {loading ? "Redirecting…" : "Checkout"}
        </Button>
      </div>
    </div>
  );
}
