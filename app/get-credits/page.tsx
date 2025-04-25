"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FaApple, FaCreditCard, FaCheckCircle } from "react-icons/fa";

// Make sure this key is correctly set in your .env.local file
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Plan = {
  id: string;
  name: string;
  credits: number;
  price: string;
  priceId: string; // This should be a Price ID, not a Product ID
};

// IMPORTANT: These should be Price IDs, not Product IDs
const PLANS: Plan[] = [  
  {
    id: "starter",
    priceId: "price_XYZ123", // Replace with actual Stripe Price ID (not Product ID)
    name: "Starter",
    credits: 25,
    price: "$9.99",
  },
  {
    id: "standard",
    priceId: "price_ABC456", // Replace with actual Stripe Price ID
    name: "Standard",
    credits: 75,
    price: "$24.99",
  },
  {
    id: "pro",
    priceId: "price_DEF789", // Replace with actual Stripe Price ID
    name: "Pro",
    credits: 200,
    price: "$49.99",
  },
  {
    id: "studio",
    priceId: "price_GHI012", // Replace with actual Stripe Price ID
    name: "Studio",
    credits: 500,
    price: "$99.99",
  },
];

export default function GetCreditsPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Create a Stripe Checkout session and redirect the user
  const handleCheckout = async (priceId: string) => {
    try {
      setLoading(true);
      setError("");
      
      // Initialize Stripe.js
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }
      
      // Call your backend to create a Checkout Session
      const res = await fetch("/api/stripe/checkout/session", {       
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }
      
      const { sessionId } = await res.json();
      
      // Redirect to Stripe Checkout
      const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });
      
      if (redirectError) {
        throw new Error(redirectError.message);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError((err as Error).message || "An unknown error occurred");
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
                  step === i + 1
                    ? "bg-red-600"
                    : "border border-gray-500"
                }`}
              >
                {step > i + 1 ? (
                  <FaCheckCircle className="text-green-400" />
                ) : (
                  <span className="font-semibold">
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className={`font-medium ${
                  step === i + 1
                    ? "text-white"
                    : "text-gray-400"
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Select your plan
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`cursor-pointer border-2 transition p-4 ${
                    selectedPlan?.id === plan.id
                      ? "border-red-600"
                      : "border-gray-200"
                  }`}
                >
                  <h3 className="text-lg font-semibold">
                    {plan.name}
                  </h3>
                  <p className="text-4xl font-extrabold text-red-600">
                    {plan.credits}
                  </p>
                  <p className="text-gray-600">{plan.price}</p>
                </Card>
              ))}
            </div>
            <div className="mt-auto flex justify-end">
              <Button
                onClick={() => {
                  if (selectedPlan) {
                    handleCheckout(selectedPlan.priceId);
                  }
                }}
                disabled={!selectedPlan || loading}
              >
                {loading ? "Processing…" : "Choose a Plan"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Enter payment details
            </h2>
            <div className="space-y-4 max-w-md">
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  if (selectedPlan) {
                    handleCheckout(selectedPlan.priceId);
                  }
                }}
                disabled={loading || !selectedPlan}
              >
                {loading ? "Processing…" : "Proceed to Payment"}
              </Button>

              <div className="text-center text-gray-500">
                You'll be redirected to our secure payment processor
              </div>
            </div>

            <div className="mt-auto flex justify-between">
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
            </div>
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
            <Button className="mt-4" onClick={() => {
              /* maybe redirect to /overview */ 
            }}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}