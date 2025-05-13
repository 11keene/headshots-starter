// File: components/ModernPricing.tsx
"use client";

import Link from "next/link";
import { useSession } from "@supabase/auth-helpers-react";    // ← NEW
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingTier {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  bestValue?: boolean;
}

export default function ModernPricing() {
  const session = useSession();                          // ← NEW

  const tiers: PricingTier[] = [
    {
      title: "Starter",
      price: "25 Credits",
      description: "First-time users trying the service.",
      features: ["4 AI Headshots", "1 credit per image", "Instant delivery"],
      buttonText: "Choose Starter",
    },
    {
      title: "Standard",
      price: "75 Credits",
      description: "Ideal for professionals requiring frequent updates.",
      features: ["12 AI Headshots", "15 credits for 1 package", "Save 17% on bundle"],
      buttonText: "Choose Standard",
      popular: true,
    },
    {
      title: "Pro",
      price: "200 Credits",
      description: "Professional users and businesses.",
      features: ["20 AI Headshots", "40 credits for 1 package", "Best value, save 33%"],
      buttonText: "Choose Pro",
      bestValue: true,
    },
    {
      title: "Studio",
      price: "500 Credits",
      description: "High-volume or agency users.",
      features: ["50 AI Headshots", "Best for bulk purchases", "Unlimited edits"],
      buttonText: "Choose Studio",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Pricing Cards */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={cn(
                "relative flex flex-col p-4 bg-ivory border rounded-lg shadow-md transition-all ease-in-out",
                "hover:scale-105 hover:shadow-xl",
                "hover:border-dusty-coral/90 hover:bg-dusty-coral/10",
                "w-[160px] h-[500px]",
                "sm:w-full sm:h-[400px] md:h-[500px] md:w-[215px] lg:flex-grow",
                tier.popular && "pricing-card-popular"
              )}
            >
              {tier.popular && (
                <div
                  className="absolute -top-4 left-12
                             bg-dusty-coral text-white
                             text-xs font-semibold
                             px-2 py-1.5
                             rounded-full"
                >
                  Most Popular
                </div>
              )}
              {tier.bestValue && (
                <div className="absolute -top-3 right-6 rounded-full bg-sage-green px-3 py-1 text-xs font-semibold text-white">
                  Best Value
                </div>
              )}

              <h3 className="text-xl text-charcoal font-bold">{tier.title}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl text-charcoal md:text-5xl font-extrabold">
                  {tier.price}
                </span>
              </div>
              <p className="mt-4 text-sm text-charcoal text-muted-foreground">
                {tier.description}
              </p>
              <ul className="my-6 space-y-4">
                {tier.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-3 text-primary" />
                    <span className="text-sm text-charcoal md:text-base leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                {/* ← UPDATED: if there's a session, go to /get-credits, else to /login */}
                <Link
                  href={
                    session
                      ? "/get-credits"
                      : `/login?redirectTo=/get-credits`
                  }
                  className="block w-full"
                  aria-label={`Select ${tier.title} plan`}
                >
                  <Button className="w-full bg-dusty-coral text-white hover:bg-sage-green">
                    {tier.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-charcoal text-sm text-muted-foreground">
          All plans include a 7-day satisfaction guarantee. Need a custom plan?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact sales
          </Link>
        </p>
      </div>
    </div>
  );
}
