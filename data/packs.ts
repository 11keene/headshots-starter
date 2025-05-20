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

// ───── THEMED PACKS (Connected to Astria) ─────
export const themedPacks: Pack[] = [
  {
    id: "2123",
    name: "Fitness Pack",
    slug: "fitness-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/i0me7mgbj67l7zdjmfertsgjfox6",
    forGender: "man",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2123",
    name: "Fitness Pack",
    slug: "fitness-pack-woman",
    exampleImg: "/CEO.pn",
    forGender: "woman",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "podcaster-pack-woman",
    name: "Podcaster Pack",
    slug: "podcaster-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/vdla0ebpv3k3q0dustaw9kylwyjc",
    forGender: "woman",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "podcaster-pack",
    name: "Podcaster Pack",
    slug: "podcaster-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/5venzqre5k4t7thgpt5341h3i651",
    forGender: "man",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2120",
    name: "Tech Pack",
    slug: "tech-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/zjmhiw9d8shwtf7astlh9c2go80a",
    forGender: "man",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2120",
    name: "Tech Pack",
    slug: "tech-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/5v10ftyz1b6n2ogpxr55uvu38cb6",
    forGender: "woman",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2118",
    name: "Realtor Pack",
    slug: "realtor-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/oje8r4637eliyudc2h2tjkhl97hx",
    forGender: "man",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2118",
    name: "Realtor Pack",
    slug: "realtor-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/b6izing8haworbs85wtd2ys2g59p",
    forGender: "woman",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2114",
    name: "Nurse Pack",
    slug: "nurse-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/d1rf7zxusfjycly456lg4q4qlsnf",
    forGender: "woman",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2114",
    name: "Nurse Pack",
    slug: "nurse-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/21kgbbunylwoc091mnvkszq2d6f0",
    forGender: "man",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2110",
    name: "Teacher Pack",
    slug: "teacher-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/ag22e8yimtl9pzefic79mau63819",
    forGender: "woman",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2110",
    name: "Teacher Pack",
    slug: "teacher-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/1fag0h007euuxohe7t4coun1vw64",
    forGender: "man",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2103",
    name: "CEO / Entrepreneur Pack",
    slug: "ceo-entrepreneur-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/559zjrizm166alers45p18mes3fl",
    forGender: "man",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
  {
    id: "2103",
    name: "CEO / Entrepreneur Pack",
    slug: "ceo-entrepreneur-pack-woman",
    exampleImg: "/CEO.png",
    forGender: "woman",
    stripePriceId: "price_1RPSLO4RnIZz7j08juzjgLQD"
  },
];

// ───── STARTER PACK (Standalone, not shown in themed list) ─────
export const starterPacks: Pack[] = [
  {
    id: "starter-pack-man",
    slug: "starter-pack-man",
    name: "Starter Pack",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/fdnkr2p8ws03s0kn7387wqrt0uva",
    forGender: "man",
    stripePriceId: "price_1ROLak4RnIZz7j08sUmtURum"
  },
  {
    id: "starter-pack-woman",
    slug: "starter-pack-woman",
    name: "Starter Pack",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/q71pphcd2z80wrz6cotqao8jl294",
    forGender: "woman",
    stripePriceId: "price_1ROLak4RnIZz7j08sUmtURum"
  },
];

// ───── CUSTOM PACK (Standalone) ─────
export const customPacks: Pack[] = [
  {
    id: "custom-intake-man",
    slug: "custom-intake-man",
    name: "Custom Pack",
    exampleImg: "",           // add your man‐pack image URL here
    forGender: "man",
    stripePriceId: "price_1RPSMg4RnIZz7j08lS1rZllC"
  },
  {
    id: "custom-intake-woman",
    slug: "custom-intake-woman",
    name: "Custom Pack",
    exampleImg: "",           // add your woman‐pack image URL here
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


// ───── BASE PACKS ─────
const basePacks: Pack[] = [
  {
    id: "2121",
    name: "Podcaster Pack",
    slug: "podcaster-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/vdla0ebpv3k3q0dustaw9kylwyjc",
    forGender: "woman",
  },
  {
    id: "2120",
    name: "Tech Pack",
    slug: "tech-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/zjmhiw9d8shwtf7astlh9c2go80a",
    forGender: "man",
  },

  {
    id: "2118",
    name: "Realtor Pack",
    slug: "realtor-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/b6izing8haworbs85wtd2ys2g59p",
    forGender: "woman",
  },

 {
    id: "2114",
    name: "Nurse Pack",
    slug: "nurse-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/21kgbbunylwoc091mnvkszq2d6f0",
    forGender: "man",
  },

  {
    id: "2110",
    name: "Teacher Pack",
    slug: "teacher-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/ag22e8yimtl9pzefic79mau63819",
    forGender: "woman",
  },
  {
    id: "2103",
    name: "CEO / Entrepreneur Pack",
    slug: "ceo-entrepreneur-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/559zjrizm166alers45p18mes3fl",
    forGender: "man",
  },
];

// ───── EXPORT ALL PACKS (base + placeholder + test) ─────
export const packs: Pack[] =
  process.env.NODE_ENV !== "production"
    ? [...placeholderPacks, ...basePacks]
    : [...placeholderPacks, ...basePacks];
