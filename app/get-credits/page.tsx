// File: app/get-credits/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FaApple, FaCreditCard, FaCheckCircle } from "react-icons/fa";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

// ↪︎ your Stripe publishable key must be set in .env.local
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Plan = {
  id: string;
  name: string;
  credits: number;
  price: string;
  priceId: string;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    priceId: "price_1RJLBd4RnIZz7j08beYwRGv1",
    name: "Starter",
    credits: 25,
    price: "$9.99",
  },
  {
    id: "standard",
    priceId: "price_1RJLCO4RnIZz7j08tJ3vN1or",
    name: "Standard",
    credits: 75,
    price: "$24.99",
  },
  {
    id: "pro",
    priceId: "price_1RJLDE4RnIZz7j08RlQUve2s",
    name: "Pro",
    credits: 200,
    price: "$49.99",
  },
  {
    id: "studio",
    priceId: "price_1RJLDf4RnIZz7j08TLcrNcQ6",
    name: "Studio",
    credits: 500,
    price: "$99.99",
  },
];

export default function GetCreditsPage() {
  const supabase = createPagesBrowserClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [cardNumber, setCardNumber] = useState("");

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
      // 1) call your new “order” endpoint
      const resp = await fetch("/api/stripe/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceIds:   [priceId],
          user_id:    user.id,
          user_email: user.email,
          successUrl: `${window.location.origin}/get-credits?status=success`,
          cancelUrl:  `${window.location.origin}/get-credits?status=cancel`,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || resp.statusText);
      }

      // 2) your endpoint returns { url }
      const { url } = await resp.json();
      if (!url) throw new Error("Missing Checkout URL");

      // 3) redirect the browser
      window.location.href = url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => setStep((s) => Math.min(3, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="bg-gray-800 text-gray-100 w-full lg:w-1/4 p-8 flex flex-col gap-6">
        {["1. Pick a Plan", "2. Payment Info", "3. Confirmation"].map(
          (label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`h-8 w-8 flex items-center justify-center rounded-full ${
                  step === i + 1 ? "bg-red-600" : "border border-gray-500"
                }`}
              >
                {step > i + 1 ? (
                  <FaCheckCircle className="text-green-400" />
                ) : (
                  <span className="font-semibold">{i + 1}</span>
                )}
              </div>
              <span
                className={`font-medium ${
                  step === i + 1 ? "text-white" : "text-gray-400"
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
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
                      ? "border-red-600"
                      : "border-gray-200"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-4xl font-extrabold text-red-600 mb-2">
                    {plan.credits}
                  </p>
                  <p className="text-gray-600 font-medium">{plan.price}</p>
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
            {/* you can keep your existing Card + Apple Pay buttons here */}
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
