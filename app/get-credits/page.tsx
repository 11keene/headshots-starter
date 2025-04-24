"use client"
// app/get-credits/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FaApple, FaCreditCard, FaCheckCircle } from "react-icons/fa";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
type Plan = {
  id: string;
  name: string;
  credits: number;
  price: string;
};

const PLANS: Plan[] = [
  { id: "starter", name: "Starter", credits: 25, price: "$9.99" },
  { id: "standard", name: "Standard", credits: 75, price: "$24.99" },
  { id: "pro", name: "Pro", credits: 200, price: "$49.99" },
];

export default function GetCreditsPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // Create a Stripe Checkout session and redirect the user
  const handleCheckout = async (priceId: string) => {
    setLoading(true);
     // Initialize Stripe.js
     const stripe = await stripePromise;
      // Call your backend to create a Checkout Session
      const res = await fetch("/api/stripe/checkout/session", {        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const { sessionId } = await res.json();
      // Redirect to Stripe Checkout
      if (stripe && sessionId) {
        await stripe.redirectToCheckout({ sessionId });
      }
      setLoading(false);
    };
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [cardNumber, setCardNumber] = useState("");

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
                  className={`cursor-pointer border-2 transition ${
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
              type="button" 
              
              onClick={goNext}           
              disabled={!selectedPlan}              
              >
                {loading ? "Loading…" : "Choose a Plan"}
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
              <label className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <div className="flex gap-2">
                <FaCreditCard className="text-gray-500 mt-2" />
                <Input
                  placeholder="•••• •••• •••• ••••"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(e.target.value)
                  }
                />
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Or pay with Apple Pay
              </label>
              + <Button
  type="button"
  variant="outline"
  className="flex items-center gap-2"
  onClick={() => {
    if (!selectedPlan) return;
     setLoading(true);
    handleCheckout(selectedPlan.id);
}}
disabled={loading || !selectedPlan}
>
              
                <FaApple size={20} />
                Apple Pay
              </Button>
            </div>

            <div className="mt-auto flex justify-between">
              <Button variant="outline" onClick={goBack}>
                
                Back
              </Button>
              <Button
              onClick={() => {
                 setLoading(true);
                 handleCheckout(selectedPlan!.id);
                }}
                 disabled={loading || !cardNumber}
                 >
                 {loading ? "Processing…" : "Pay Now"}
                 </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              You’re all set!
            </h2>
            <p className="text-gray-600">
              {`You’ve purchased ${selectedPlan?.credits} credits.`}
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
