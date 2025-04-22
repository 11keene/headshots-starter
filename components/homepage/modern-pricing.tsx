"use client"

import Link from "next/link"
import type React from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Define the brand's red color
const brandRed = "#E11D48"; // Example of brand red, adjust as necessary

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
  const tiers: PricingTier[] = [
    {
      title: "Basic",
      price: "25 Credits",
      description: "First-time users trying the service.",
      features: ["4 AI Headshots", "1 credit per image", "Instant delivery"],
      buttonText: "Choose Basic",
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
  ]

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Pricing Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-4 lg:gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                "pricing-card",
                tier.popular && "pricing-card-popular",
                "flex flex-col p-6 bg-white border rounded-lg shadow-md h-[500px] w-[215px] flex-grow hover:bg-[#f7f7f7] hover:scale-105 transition-all duration-300" // Adjusted hover effect on the card
              )}
            >
              {tier.popular && (
                <div className="pricing-badge">
                  Most Popular
                </div>
              )}

              {tier.bestValue && (
                <div className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white dark:bg-blue-500">
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
                <span className="text-5xl font-extrabold">{tier.price}</span>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{tier.description}</p>

              <ul className="my-6 space-y-4">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="pricing-feature">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Add this div to align and position the "Choose" button correctly */}
              <div className="mt-auto">
                <Link href="/login" className="block w-full" aria-label={`Select ${tier.title} plan`}>
                  <Button
                    className={cn(
                      "w-full",
                      "bg-[#E11D48] hover:bg-[#B91C4A] text-white transition-colors"
                    )}
                    aria-label={`Select ${tier.title} plan`}
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          All plans include a 7-day satisfaction guarantee. Need a custom plan?{" "}
          <Link 
            href="/contact" 
            className="text-primary hover:underline"
            aria-label="Contact our sales team">
            Contact sales
          </Link>
        </p>
      </div>
    </div>
  )
}
