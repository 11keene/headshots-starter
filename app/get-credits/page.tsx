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
  priceId: string;
};

// IMPORTANT: These should be Price IDs, not Product IDs
// Price IDs typically start with "price_"
const PLANS: Plan[] = [
  {
    id: "starter",
    priceId: "price_1RHmnVCs03tLUXoK4iTvnduW", // Update with your actual Price ID
    name: "Starter",
    credits: 25,
    price: "$9.99",
  },
  {
    id: "standard",
    priceId: "price_1RHmnnCs03tLUXoKLXWGbUqt", // Update with your actual Price ID
    name: "Standard",
    credits: 75,
    price: "$24.99",
  },
  {
    id: "pro",
    priceId: "price_1RHmo9Cs03tLUXoKiIai8D2O", // Update with your actual Price ID
    name: "Pro",
    credits: 200,
    price: "$49.99",
  },
  {
    id: "studio",
    priceId: "price_1RHmoNCs03tLUXoKRpzgeqUu", // Update with your actual Price ID
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

  // Create a Stripe Checkout session and redirect the user
  const handleCheckout = async (priceId: string) => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Starting checkout for priceId:", priceId);
      
      // Initialize Stripe.js
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to initialize Stripe");
      }
      
      // Call your backend to create a Checkout Session
      const response = await fetch("/api/stripe/checkout/session", {       
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      
      // Check if the response is OK
      if (!response.ok) {
        console.error("API error:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("API error details:", errorText);
        
        let errorMessage = "Payment processing failed";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      // Safely parse the JSON response
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error("Failed to parse response:", err);
        throw new Error("Invalid response from server");
      }
      
      if (!data.URL) {
        console.error("Redirecting to checkout URL:", data.url);
        window.location.href = data.url;
        return;
        throw new Error("Invalid checkout session");
      }
      
      console.log("Redirecting to checkout with sessionId:", data.sessionId);
      
      // Redirect to Stripe Checkout
      const { error: redirectError } = await stripe.redirectToCheckout({ 
        sessionId: data.sessionId 
      });
      
      if (redirectError) {
        console.error("Redirect error:", redirectError);
        throw new Error(redirectError.message);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError((err as Error).message || "An unknown error occurred");
    } finally {
      setLoading(false); // Reset loading state regardless of outcome
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
                  if (selectedPlan) {
                    handleCheckout(selectedPlan.priceId);
                  } else {
                    setError("Please select a plan first");
                  }
                }}
                disabled={loading}
                className="px-8 py-2 text-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing
                  </div>
                ) : (
                  "Proceed to Checkout"
                )}
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
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <Button
                type="button"
                className="w-full mt-4"
                onClick={() => {
                  if (selectedPlan) {
                    handleCheckout(selectedPlan.priceId);
                  } else {
                    setError("No plan selected");
                  }
                }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing
                  </div>
                ) : (
                  "Pay with Card"
                )}
              </Button>

              <div className="relative flex items-center py-5">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center gap-2 w-full"
                onClick={() => {
                  if (selectedPlan) {
                    handleCheckout(selectedPlan.priceId);
                  } else {
                    setError("No plan selected");
                  }
                }}
                disabled={loading}
              >
                <FaApple size={24} />
                Pay with Apple Pay
              </Button>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={goBack} disabled={loading}>
                Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (selectedPlan) {
                    handleCheckout(selectedPlan.priceId);
                  } else {
                    setError("No plan selected");
                  }
                }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing
                  </div>
                ) : (
                  "Complete Payment"
                )}
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
            <Button
              className="mt-4"
              onClick={() => {
                /* maybe redirect to /overview */
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