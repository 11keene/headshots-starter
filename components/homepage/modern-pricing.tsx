// File: components/ModernPricing.tsx
"use client";

import Link from "next/link";
import { useSession } from "@supabase/auth-helpers-react";
import {
  Check,
  FileText,
  Image as ImageIcon,
  Sun,
  User,
  LayoutGrid,
  Star,
  Palette,
  Mic,
  Award,
  Shirt,
  Layers,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Feature {
  icon: React.ElementType;
  label: string;
}

interface PricingTier {
  title: string;
  price: string;
  originalPrice: string;
  description: string;
  features: Feature[];
  buttonText: string;
  popular?: boolean;
  bestValue?: boolean;
}

export default function ModernPricing() {
  const session = useSession();

  const tiers: PricingTier[] = [
    {
      title: "Premium",
      originalPrice: "$80",
      price: "$45",
      description:
        "Polished. Personalized. Powerful. This is your all-in-one branding solution — built for professionals who want to show up ready.",
      features: [
        {
          icon: ImageIcon,
          label: "45 stunning AI-generated headshots crafted from your selfies",
        },
        {
          icon: User,
          label:
            "Fully personalized to your profession, wardrobe, vibe, setting, and brand",
        },
        {
          icon: Star,
          label: "Delivered in under 60 minutes — not weeks",
        },
        {
          icon: Mic,
          label:
            "Styled for LinkedIn, speaking, websites, and media kits",
        },
        {
          icon: Award,
          label: "Yours to use anywhere with full commercial rights",
        },
        {
          icon: Shirt,
          label: "All attires and backgrounds included",
        },
        {
          icon: LayoutGrid,
          label: "Enhanced image resolution",
        },
      ],
      buttonText: "Create My Headshots",
    },
  ];


  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-md">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={cn(
                  "group relative flex flex-col p-6 bg-charcoal/100 border rounded-lg shadow-md transition-all ease-in-out",
                  tier.popular && "border-2 border-muted-gold",
                  "hover:scale-105 hover:shadow-xl",
                  "hover:border-muted-gold hover:bg-charcoal/90",
                  "w-full",
                  tier.popular && "pricing-card-popular"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-4 right-6 bg-muted-gold text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}
                {tier.bestValue && (
                  <div className="absolute -top-3 right-6 rounded-full bg-sage-green px-3 py-1 text-xs font-semibold text-white">
                    Best Value
                  </div>
                )}

<>
  <h3 className="text-5xl text-sage-green font-bold text-center">
    {tier.title}
  </h3>

  <div className="mt-2 relative inline-block mx-auto">
    {/* original price, perched at top-right */}
    <span className="absolute -top-3 left-20 text-lg line-through text-muted/70">
      {tier.originalPrice}
    </span>

    {/* big discounted price */}
    <span className="block text-5xl text-ivory font-extrabold">
      {tier.price}
    </span>
  </div>

  <p className="mt-4 text-xs font-semibold text-white text-center">
    {tier.description}
  </p>
  <ul className="my-6 space-y-6">
    {tier.features.map((feat, i) => {
      const Icon = feat.icon || Check;
      return (
        <li key={i} className="flex items-center gap-3">
          <Icon size={20} className="text-sage-green flex-shrink-0" />
          <span className="text-xs text-ivory leading-snug">{feat.label}</span>
        </li>
      );
    })}
  </ul>
</>

{/* ─────────── HOW IT WORKS BLOCK ─────────── */}
<div className="mt-6 pt-4 border-t border-muted/30">
  <h4 className="text-lg font-semibold text-white mb-2">How It Works:</h4>
  <p className="text-sm text-ivory mb-2">
    Before purchase, you&#8217;ll complete a <strong>guided intake form</strong> — this is your creative brief. You’ll choose everything from your wardrobe style to your professional field, background setting, hair texture, body type, and overall mood.
  </p>
  <p className="text-sm text-ivory">
    From there, we create a shoot that looks and feels like you at your best. No generic avatars. No random results. Just clean, compelling, editorial-quality visuals that align with your goals — and your greatness.
  </p>
</div>

<div className="mt-8">
                    <Link
                    href={session ? "/get-credits" : `/login?redirectTo=/get-credits`}
                    className="block w-full"
                    aria-label={`Select ${tier.title} plan`}
                  >
                    <Button className="w-full bg-muted/70 text-white transition group-hover:bg-sage-green group-hover:text-white">
                      {tier.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-charcoal text-sm text-muted-foreground">
          Need a custom plan?{" "}
          <Link href="mailto:support@aimavenstudio.com" className="text-muted-gold hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}