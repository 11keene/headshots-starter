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
      originalPrice: "$37.49",
      price: "$29.99",
      description:
        "Ideal for updating your LinkedIn, profile picture, or personal brand with clean, natural looks that build instant credibility.",
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
      originalPrice: "$53.74",
      price: "$42.99",
      description:
        "Each pack is built around a powerful theme. You’ll receive a full visual collection tailored to your industry’s tone and aesthetic.",
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
      originalPrice: "$87.49",
      price: "$69.99",
      description:
        "Your personalized photoshoot — We use your style preferences, mood, industry, and brand voice to generate a completely customized set of professional images.",
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
                "group relative flex flex-col p-6 bg-charcoal/100 border rounded-lg shadow-md transition-all ease-in-out",
                 tier.popular && "border-2 border-muted-gold",
                "hover:scale-105 hover:shadow-xl",
                "hover:border-muted-gold hover:bg-charcoal/50",
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

              <h3 className="text-2xl text-white font-bold">{tier.title}</h3>

              <div className="mt-2 relative">
                {/* struck-through original price */}
                <span className="absolute -top-2 right-12 md:right-1 text-lg line-through text-white">
                  {tier.originalPrice}
                </span>
                {/* discounted price */}
                <span className="text-5xl text-sage-green font-extrabold">
                  {tier.price}
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold text-ivory">
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
                      <Icon className="h-5 w-5 text-sage-green" />
                      <span className="text-xs text-white leading-snug">{feat}</span>
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
                  <Button className="w-full bg-muted/70 text-white transition group-hover:bg-sage-green group-hover:text-white">
                    {tier.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
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
