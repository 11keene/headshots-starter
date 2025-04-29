// components/ModernPricing.tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type React from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingTier {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  stripePriceId: string;
  popular?: boolean;
  bestValue?: boolean;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const tiers: PricingTier[] = [
  {
    title: "Starter",
    price: "25 Credits",
    description: "First-time users trying the service.",
    features: ["4 AI Headshots", "1 credit per image", "Instant delivery"],
    buttonText: "Choose Starter",
    stripePriceId: process.env.NEXT_PUBLIC_PRICE_STARTER_ID!,
  },
  {
    title: "Standard",
    price: "75 Credits",
    description: "Ideal for professionals requiring frequent updates.",
    features: ["12 AI Headshots", "15 credits for 1 package", "Save 17% on bundle"],
    buttonText: "Choose Standard",
    popular: true,
    stripePriceId: process.env.NEXT_PUBLIC_PRICE_STANDARD_ID!,
  },
  {
    title: "Pro",
    price: "200 Credits",
    description: "Professional users and businesses.",
    features: ["20 AI Headshots", "40 credits for 1 package", "Best value, save 33%"],
    buttonText: "Choose Pro",
    bestValue: true,
    stripePriceId: process.env.NEXT_PUBLIC_PRICE_PRO_ID!,
  },
  {
    title: "Studio",
    price: "500 Credits",
    description: "High-volume or agency users.",
    features: ["50 AI Headshots", "Best for bulk purchases", "Unlimited edits"],
    buttonText: "Choose Studio",
    stripePriceId: process.env.NEXT_PUBLIC_PRICE_STUDIO_ID!,
  },
];

export default function ModernPricing() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (priceId: string) => {
    setLoading(true);
    const stripe = await stripePromise;
    if (!stripe) {
      console.error("Stripe failed to load.");
      setLoading(false);
      return;
    }
    const { error } = await stripe.redirectToCheckout({
      mode: "payment",
      lineItems: [{ price: priceId, quantity: 1 }],
      successUrl: window.location.origin + "/overview",
      cancelUrl: window.location.origin + "/pricing",
    });
    if (error) console.error(error);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Pricing Cards */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={cn(
                "relative flex flex-col p-4 bg-white border rounded-lg shadow-md transition-all ease-in-out hover:scale-105 hover:shadow-xl",
                "w-[160px] h-[500px]",
                "sm:w-full sm:h-[400px] md:h-[500px] md:w-[215px] lg:flex-grow",
                "hover:bg-red-200",
                tier.popular && "pricing-card-popular"
              )}
            >
              {tier.popular && <div className="pricing-badge">Most Popular</div>}
              {tier.bestValue && (
                <div className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Best Value
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold">{tier.title}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl md:text-5xl font-extrabold">{tier.price}</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{tier.description}</p>
              <ul className="my-6 space-y-4">
                {tier.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-3 text-primary" />
                    <span className="text-sm md:text-base leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <Button
                  onClick={() => handleCheckout(tier.stripePriceId)}
                  className="w-full text-white bg-red-600 hover:bg-red-700"
                  disabled={loading}
                  aria-label={`Select ${tier.title} plan`}
                >
                  {loading ? "Loading..." : tier.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          All plans include a 7-day satisfaction guarantee. Need a custom plan?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact sales
          </Link>
        </p>
      </div>
    </div>
  );
}
