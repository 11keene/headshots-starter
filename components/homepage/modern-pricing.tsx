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
      title: "The Professional Pack",
      originalPrice: "$56.24",
      price: "$44.99",
      description:
        "Designed for professionals who want a polished headshot tailored to a single role or brand identity. This is your go-to image: Perfect for LinkedIn, business websites, speaker bios, and more.",
      features: [
        "15 fully customized AI-generated images",
        "Tailored to one industry or role",
        "Personalization based on your intake (vibe, brand colors, wardrobe, setting)",
        "Clean, minimal styling with a consistent look and feel across all images",
      ],
      buttonText: "Choose Professional",
    },
    {
      title: "Multi-Purpose Pack",
      originalPrice: "$68.74",
      price: "$54.99",
      description:
        "This pack is for people with layered identities. Whether you're a CEO by day and a painter by night, or a speaker, coach, and consultant all in one - this image set is designed to show your full range. You'll get visuals that reflect each of the roles you choose, all styled to feel cohesive while capturing different sides of your brand.",
      features: [
        "15 AI-generated images tailored to multiple industries or roles",
        "Each image reflects a distinct identity (e.g., founder, educator, artist)",
        "Custom prompts based on your intake form - same flow, but optimized to create variety in style, setting, and tone",
        "Different outfits, backgrounds, and expressions to reflect the roles you play",
      ],
      buttonText: "Choose Multi-Purpose",
      popular: true,
    },
    
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
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
                  // ───────────────────────────────────────────────
                  // Step 1: convert to lowercase for case-insensitive matching
                  const text = feat.toLowerCase();

                  // Step 2: default icon is a checkmark
                  let Icon = Check;

                  // Step 3: pick the correct icon based on keywords in the lowercase string
                  if (text.includes("ai-generatedimages")) {
                    // (unlikely to match exactly without typo, but we check separately for "ai-generated images")
                    Icon = ImageIcon;
                  }
                  else if (text.includes("ai-generated images")) {
                    // “15 AI-generated images inspired by your reference image”
                    Icon = ImageIcon;
                  }
                  else if (text.includes("images tailored")) {
                    // “15 AI-generated images tailored to multiple industries or roles”
                    Icon = ImageIcon;
                  }
                  else if (text.includes("each image")) {
                    // “Each image reflects a distinct identity …”
                    Icon = ImageIcon;
                  }
                  else if (text.includes("prompts")) {
                    // “Custom prompts based on your intake form …”
                    Icon = FileText;
                  }
                  else if (text.includes("unique outfits") || text.includes("outfits")) {
                    // “Different outfits, backgrounds, and expressions …”
                    Icon = Shirt;
                  }
                  else if (text.includes("unique backgrounds") || text.includes("backgrounds")) {
                    // “15 Unique Backgrounds” or “Different outfits, backgrounds …”
                    Icon = LayoutGrid;
                  }
                  else if (text.includes("inspired by your reference")) {
                    // “15 AI-generated images inspired by your reference image”
                    Icon = ImageIcon;
                  }
                  else if (text.includes("replicates") || text.includes("composition") || text.includes("pose") || text.includes("mood") || text.includes("aesthetic")) {
                    // “Replicates the composition, pose, mood, or aesthetic …”
                    Icon = Layers;
                  }
                  else if (text.includes("lighting")) {
                    // (if you ever add “lighting” feature back)
                    Icon = Sun;
                  }
                  else if (text.includes("reflects your brand")) {
                    // “Reflects your brand tone, emotional energy, and usage goals”
                    Icon = Palette;
                  }
                  else if (text.includes("speaker pages")) {
                    // “Ideal for speaker pages, business websites, and media kits”
                    Icon = Mic;
                  }
                  else if (text.includes("visual storytelling")) {
                    // “Includes deeper visual storytelling moments …”
                    Icon = Star;
                  }
                  else if (text.startsWith("15 prompts") || text.startsWith("15 prompts • 45 images")) {
                    // The old “15 Prompts • 45 Images • 15 Unique Outfits • 15 Unique Backgrounds” 
                    Icon = FileText;
                  }
                  else if (text.startsWith("15 fully customized ai-generated images")) {
                    // “15 fully customized AI-generated images”
                    Icon = ImageIcon;
                  }
                  else if (text.startsWith("tailored to")) {
                    // “Tailored to one industry or role”
                    Icon = Target;
                  }
                  else if (text.startsWith("personalization")) {
                    // “Personalization based on your intake …”
                    Icon = Award;
                  }
                  else if (text.startsWith("clean, minimal styling")) {
                    // “Clean, minimal styling with a consistent look …”
                    Icon = Palette;
                  }
                  else if (text.includes("ideal for recreating")) {
                    // “Ideal for recreating something iconic …”
                    Icon = Award;
                  }
                  // ───────────────────────────────────────────────

                  return (
             <li key={i} className="flex items-center gap-2">
  <div className="relative h-5 w-5">
<Icon size={20} strokeWidth={2} className="text-sage-green" />
      {/* do NOT pass a `size` prop—letting it fill its parent */}
  </div>
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
