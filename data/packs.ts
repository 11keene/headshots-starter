// File: data/packs.ts

export interface Pack {
  id: string;             // THIS is just a slug, not a DB UUID
  slug?: string;
  name: string;           // Display name
  exampleImg: string;     // (optional preview image URL)
  forGender: "woman" | "man" | "all";
  stripePriceId?: string; // Your Stripe price ID for this pack type
}

// ───── PROFESSIONAL PACK ─────
export const professionalPacks: Pack[] = [
  {
    id: "professional-pack-man",
    slug: "professional-pack-man",
    name: "Professional Pack (Man)",
    exampleImg: "/images/pro-pack-man.png", // optional preview
    forGender: "man",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_MAN!,
  },
  {
    id: "professional-pack-woman",
    slug: "professional-pack-woman",
    name: "Professional Pack (Woman)",
    exampleImg: "/images/pro-pack-woman.png",
    forGender: "woman",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_WOMAN!,
  },
];

// ───── MULTI-PURPOSE PACK ─────
export const multiPurposePacks: Pack[] = [
  {
    id: "multi-purpose-man",
    slug: "multi-purpose-man",
    name: "Multi-Purpose Pack (Man)",
    exampleImg: "/images/multi-man.png",
    forGender: "man",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MULTI_MAN!,
  },
  {
    id: "multi-purpose-woman",
    slug: "multi-purpose-woman",
    name: "Multi-Purpose Pack (Woman)",
    exampleImg: "/images/multi-woman.png",
    forGender: "woman",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MULTI_WOMAN!,
  },
];

// Export all active packs for the Overview page
export const packs: Pack[] = [
  ...professionalPacks,
  ...multiPurposePacks,
  // (any extras, etc.)
];
