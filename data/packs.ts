// data/packs.ts

export interface Pack {
  id: string;              // Astria Pack ID or internal slug
  name: string;            // Display name for the pack
  exampleImg: string;      // Preview image shown in the UI
  prompt_template?: string;
  forGender: "woman" | "man" | "all";
  slug?: string;
  stripePriceId?: string;  // Optional Stripe price ID for the pack
}

// ───── PLACEHOLDER PACKS ─────
export const placeholderPacks: Pack[] = [];

// ───── CUSTOM PACK (Standalone) ─────
export const customPacks: Pack[] = [
  {
    id: "custom-intake-man",
    slug: "custom-intake-man",
    name: "Custom Pack",
    exampleImg: "",           // your man‐pack image URL here
    forGender: "man",
    stripePriceId: "price_1RPSMg4RnIZz7j08lS1rZllC"
  },
  {
    id: "custom-intake-woman",
    slug: "custom-intake-woman",
    name: "Custom Pack",
    exampleImg: "",           // your woman‐pack image URL here
    forGender: "woman",
    stripePriceId: "price_1RPSMg4RnIZz7j08lS1rZllC"
  }
];

// ───── EXTRA ADD-ON: one extra headshot ─────
export const extrasPacks: Pack[] = [
  {
    id: "extra-headshot",
    name: "Additional Photo",
    exampleImg: "/images/extra-photo.png",
    forGender: "all",
    stripePriceId: "price_1RPV3C4RnIZz7j08faR6KeJW"
  }
];

// (optionally, any “basePacks” you still want)
const basePacks: Pack[] = [
  // …if you really still need any of these, otherwise delete this block too
];

// ───── EXPORT ALL YOUR ACTIVE PACKS ─────
export const packs: Pack[] = [
  ...placeholderPacks,
  ...customPacks,
  ...extrasPacks,
  // ...basePacks,      // ← uncomment if you kept basePacks
];
