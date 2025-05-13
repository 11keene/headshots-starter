// File: app/get-credits/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Card } from "@/components/ui/card";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { FaApple, FaCreditCard, FaCheckCircle } from "react-icons/fa";

// ↪︎ your Stripe publishable key must be set in .env.local
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Plan = {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: string;
  originalPrice: string;    // ← new field
  priceId: string;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    priceId: "price_1ROLak4RnIZz7j08sUmtURum",
    name: "Starter Pack",
    credits: 25,
    originalPrice: "$39.99",   // ← your crossed-out price
    price: "$29.99",
    description:
      "6 Prompts • 18 Images • 6 Unique Outfits • 6 Unique Backgrounds",
  },
  {
    id: "themed packs",
    priceId: "price_1ROLcD4RnIZz7j08FGJELQOA",
    name: "Themed Packs",
    credits: 75,
    originalPrice: "$72.99",
    price: "$59.99",
    description:
      "15 Prompts • 45 Images • 15 Unique Outfits • 15 Unique Backgrounds",
  },
  {
    id: "custom pack",
    priceId: "price_1ROLdH4RnIZz7j08wZHLLtcz",
    name: "Custom Pack",
    credits: 200,
    originalPrice: "$99.99",
    price: "$74.99",
    description:
      "15 Prompts • 45 Images • 15 Unique Outfits • 15 Unique Backgrounds",
  },
];

export default function GetCreditsPage() {
  const supabase = createPagesBrowserClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // fetch the logged-in user
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email! });
      }
    });
  }, [supabase]);

  // Create a Stripe Checkout session and redirect the user
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      setError("You must be logged in to purchase credits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/stripe/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          user_id: user.id,
          user_email: user.email,
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || resp.statusText);
      }
      const { sessionId } = await resp.json();
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe.js failed to load");
      await stripe.redirectToCheckout({ sessionId });
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="bg-warm-gray text-charcoal w-full lg:w-1/4 p-8 flex flex-col gap-6">
        {["1. Pick a Plan", "2. Payment Info", "3. Confirmation"].map(
          (label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`h-8 w-8 flex items-center justify-center rounded-full ${
                  step === i + 1 ? "bg-dusty-coral" : "border border-dusty-coral"
                }`}
              >
                {step > i + 1 ? (
                  <FaCheckCircle className="text-sage-green" />
                ) : (
                  <span className="font-semibold">{i + 1}</span>
                )}
              </div>
              <span
                className={`font-medium ${
                  step === i + 1 ? "text-white" : "text-charcoal"
                }`}
              >
                {label}
              </span>
            </div>
          )
        )}
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8 flex flex-col">
        {error && (
          <div className="bg-dusty-coral px-4 py-3 rounded mb-4 relative">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError("")}
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Select your plan
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`cursor-pointer border-2 transition p-6 ${
                    selectedPlan?.id === plan.id
                      ? "border-dusty-coral"
                      : "border-warm-gray"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>

                  {/* price block with crossed-out original */}
                  <div className="relative mb-6">
                    <span className="absolute -top-2 right-1 md:right-4 text-sm line-through text-muted-foreground">
                      {plan.originalPrice}
                    </span>
                    <p className="text-4xl font-extrabold text-dusty-coral">
                      {plan.price}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => {
                  if (!selectedPlan) {
                    setError("Please select a plan first");
                  } else {
                    handleCheckout(selectedPlan.priceId);
                  }
                }}
                disabled={loading}
                className="px-8 py-2 text-lg"
              >
                {loading ? "Processing…" : "Proceed to Checkout"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Enter payment details
            </h2>
            {/* keep your existing Card + Apple Pay buttons here */}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              You're all set!
            </h2>
            <p className="text-gray-600">
              {`You've purchased ${selectedPlan?.credits} credits.`}
            </p>
            <FaCheckCircle className="mx-auto text-green-500 text-6xl" />
            <p className="text-gray-600">
              A confirmation email is on its way.
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
