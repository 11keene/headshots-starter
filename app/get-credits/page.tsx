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
  { id: "starter",  priceId: "price_…,", name: "Starter",  credits: 25,  price: "$9.99" },
  { id: "standard", priceId: "price_…,", name: "Standard", credits: 75,  price: "$24.99" },
  { id: "pro",      priceId: "price_…,", name: "Pro",      credits: 200, price: "$49.99" },
  { id: "studio",   priceId: "price_…,", name: "Studio",   credits: 500, price: "$99.99" },
];

export default function GetCreditsPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  // Only run after Stripe comes back with pack & session_id
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSessionId = params.get("session_id");
    const packId = params.get("pack");

    // **Guard**: if we don't have both, do nothing
    if (!stripeSessionId || !packId || !user) {
      return;
    }

    // Otherwise record the order & advance to Step 3
    fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId, sessionId: stripeSessionId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Purchase record failed");
        setStep(3);
        // Clear the query params so you can refresh without looping
        router.replace("/get-credits");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not record purchase");
      });
  }, [user, router]);

  const handleCheckout = async (priceId: string, plan: Plan) => {
    setSelectedPlan(plan);
    setLoading(true);
    setError("");

    const stripe = await stripePromise;
    if (!stripe) return setError("Stripe init failed");

    const res = await fetch("/api/stripe/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    if (!res.ok) {
      setError("Payment API error");
      setLoading(false);
      return;
    }
    const { sessionId } = await res.json();
    stripe.redirectToCheckout({ sessionId });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar omitted for brevity… */}

      <div className="flex-grow p-8">
        {error && (
          <div className="bg-red-100 px-4 py-3 mb-4 rounded">
            {error}
            <button onClick={() => setError("")} className="float-right">×</button>
          </div>
        )}

        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-6">Select your plan</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  onClick={() => handleCheckout(plan.priceId, plan)}
                  className={`p-6 border-2 cursor-pointer ${
                    selectedPlan?.id === plan.id ? "border-red-600" : "border-gray-200"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <p className="text-4xl font-extrabold text-red-600 mb-2">
                    {plan.credits}
                  </p>
                  <p className="text-gray-600">{plan.price}</p>
                </Card>
              ))}
            </div>
          </>
        )}

        {step === 2 && selectedPlan && (
          <>
            <h2 className="text-2xl font-bold mb-6">Enter payment details</h2>
            {/* Your card input UI… */}
            <Button onClick={() => handleCheckout(selectedPlan.priceId, selectedPlan)} disabled={loading}>
              {loading ? "Processing…" : "Pay with Card"}
            </Button>
          </>
        )}

        {step === 3 && selectedPlan && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">You're all set!</h2>
            <p>You’ve purchased {selectedPlan.credits} credits.</p>
            <FaCheckCircle className="text-green-500 text-6xl my-4" />
            <Button onClick={() => router.push("/overview")}>Go to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
