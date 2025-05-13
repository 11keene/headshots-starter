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

interface PricingTier {
  title: string;
  price: string;
  originalPrice: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  bestValue?: boolean;
}

export default function ModernPricing() {
  const session = useSession();

  const tiers: PricingTier[] = [
    {
      title: "Starter Pack",
      originalPrice: "$39.99",
      price: "$29.99",
      description:
        "A curated mini-shoot designed to deliver polished, professional images — fast. Ideal for updating your LinkedIn, profile picture, or personal brand with clean, natural looks that build instant credibility.",
      features: [
        "6 Prompts • 18 Images • 6 Unique Outfits • 6 Unique Backgrounds",
        "Studio-style lighting with warm, inviting tones",
        "A mix of close-up and mid-length poses",
        "Clean, modern backgrounds that work across industries",
        "Designed to make a strong first impression without the overwhelm",
      ],
      buttonText: "Get Starter Pack",
    },
    {
      title: "Themed Packs",
      originalPrice: "$72.99",
      price: "$59.99",
      description:
        "Each pack is built around a powerful theme — from CEO to Teacher, Nurse, Realtor, Creative Professional, and more. Every prompt has been handcrafted to reflect your role, energy, and brand identity. You’ll receive a full visual collection tailored to your industry’s tone and aesthetic.",
      features: [
        "15 Prompts • 45 Images • 15 Unique Outfits • 15 Unique Backgrounds",
        "Profession-specific styling and pose direction",
        "A balanced mix of headshots, lifestyle, and leadership moments",
        "Natural lighting, minimal backgrounds, and intentional color use",
      ],
      buttonText: "Shop Themed Packs",
      popular: true,
    },
    {
      title: "Custom Pack",
      originalPrice: "$99.99",
      price: "$74.99",
      description:
        "This is your personalized photoshoot — powered by your answers. We use your style preferences, mood, industry, and brand voice to generate a completely customized set of professional images. Every detail is tailored to your unique vision, with prompts generated using our proprietary GPT system.",
      features: [
        "15 Prompts • 45 Images • 15 Unique Outfits • 15 Unique Backgrounds",
        "Personalized outfits, background settings, poses, and vibe",
        "Reflects your brand tone, emotional energy, and usage goals",
        "Ideal for speaker pages, business websites, and media kits",
        "Includes deeper visual storytelling moments for maximum impact",
      ],
      buttonText: "Create Your Custom Pack",
      bestValue: true,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={cn(
                "relative flex flex-col p-6 bg-ivory border rounded-lg shadow-md transition-all ease-in-out",
                "hover:scale-105 hover:shadow-xl",
                "hover:border-dusty-coral/90 hover:bg-dusty-coral/10",
                "w-full",
                tier.popular && "pricing-card-popular"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 right-6 bg-dusty-coral text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  Most Popular
                </div>
              )}
              {tier.bestValue && (
                <div className="absolute -top-3 right-6 rounded-full bg-sage-green px-3 py-1 text-xs font-semibold text-white">
                  Best Value
                </div>
              )}

              <h3 className="text-2xl text-charcoal font-bold">{tier.title}</h3>

              <div className="mt-2 relative">
                {/* struck-through original price */}
                <span className="absolute -top-2 right-12 md:right-1 text-lg line-through text-muted-foreground">
                  {tier.originalPrice}
                </span>
                {/* discounted price */}
                <span className="text-5xl text-dusty-coral font-extrabold">
                  {tier.price}
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold text-charcoal text-muted-foreground">
                {tier.description}
              </p>

              <ul className="my-6 space-y-4">
                {tier.features.map((feat, i) => {
                  let Icon = Check;
                  if (feat.includes("Prompts")) Icon = FileText;
                  else if (feat.includes("Images")) Icon = ImageIcon;
                  else if (feat.includes("Unique Outfits")) Icon = Shirt;
                  else if (feat.includes("Unique Backgrounds")) Icon = LayoutGrid;
                  else if (feat.toLowerCase().includes("lighting")) Icon = Sun;
                  else if (feat.toLowerCase().includes("pose")) Icon = User;
                  else if (feat.toLowerCase().includes("mix of headshots")) Icon = Layers;
                  else if (feat.toLowerCase().includes("first impression")) Icon = Target;
                  else if (feat.toLowerCase().includes("reflects your brand")) Icon = Palette;
                  else if (feat.toLowerCase().includes("speaker pages")) Icon = Mic;
                  else if (feat.toLowerCase().includes("visual storytelling"))
                    Icon = Star;
                  else if (feat.toLowerCase().startsWith("perfect for:")) Icon = Award;

                  return (
                    <li key={i} className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-xs leading-snug">{feat}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto">
                <Link
                  href={session ? "/get-credits" : `/login?redirectTo=/get-credits`}
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
          Need a custom plan?{" "}
          <Link href="mailto:support@aimavenstudio.com" className="text-primary hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
