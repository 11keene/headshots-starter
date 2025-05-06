// app/get-credits/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FaApple, FaCreditCard, FaCheckCircle } from "react-icons/fa";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

// Make sure this key is correctly set in your .env.local file
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

// IMPORTANT: These should be Price IDs, not Product IDs
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [cardNumber, setCardNumber] = useState("");

  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  // After Stripe redirects back, record the purchase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSessionId = params.get("session_id");
    const packId = params.get("pack");

    if (stripeSessionId && packId && user) {
      fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId, sessionId: stripeSessionId }),
      })
        .then(() => {
          // clear query params and show confirmation
          router.replace(window.location.pathname);
          setStep(3);
        })
        .catch((err) => console.error("Failed to record purchase:", err));
    }
  }, [user, router]);

  const handleCheckout = async (priceId: string) => {
    try {
      setLoading(true);
      setError("");

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Failed to initialize Stripe");

      const response = await fetch("/api/stripe/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Payment processing failed");
      }

      const data = await response.json();
      if (!data.sessionId) throw new Error("Invalid checkout session");

      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err) {
      console.error("Checkout error:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => setStep((s) => Math.min(3, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar and steps... unchanged */}
      {/* ... */}

      {/* Main Content */}
      <div className="flex-grow p-8 flex flex-col">
        {/* Step 1: plan selection */}
        {/* unchanged */}

        {/* Step 2: payment details */}
        {/* unchanged */}

        {/* Step 3: confirmation */}
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
              onClick={() => router.push("/overview")}
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
