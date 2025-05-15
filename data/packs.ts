// File: data/packs.ts

export interface Pack {
  id: string;              // Astria Pack ID or internal slug
  name: string;            // Display name for the pack
  exampleImg: string;      // Preview image shown in the UI
  prompt_template?: string;
  forGender: "woman" | "man" | "all";
  slug?: string;
}

// ───── PLACEHOLDER PACKS ─────
const placeholderPacks: Pack[] = [
  {
    id: "placeholder-woman",
    name: "Women’s Upsell (Coming Soon)",
    exampleImg: "/images/placeholder-woman.png",
    forGender: "woman",
  },
  {
    id: "placeholder-man",
    name: "Men’s Upsell (Coming Soon)",
    exampleImg: "/images/placeholder-man.png",
    forGender: "man",
  },
];

// ───── THEMED PACKS (Connected to Astria) ─────
export const themedPacks: Pack[] = [
  {
    id: "2123",
    name: "Fitness Pack",
    slug: "fitness-pack-man",
    exampleImg: "https://images.unsplash.com/photo-1599058917212-d750089bc4e3",
    forGender: "man",
  },
  {
    id: "2123",
    name: "Fitness Pack",
    slug: "fitness-pack-woman",
    exampleImg: "https://images.unsplash.com/photo-1599058917212-d750089bc4e3",
    forGender: "woman",
  },
  {
    id: "2121",
    name: "Podcaster Pack",
    slug: "podcaster-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/vdla0ebpv3k3q0dustaw9kylwyjc",
    forGender: "woman",
  },
  {
    id: "2121",
    name: "Podcaster Pack",
    slug: "podcaster-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/5venzqre5k4t7thgpt5341h3i651",
    forGender: "man",
  },
  {
    id: "2120",
    name: "Tech Pack",
    slug: "tech-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/zjmhiw9d8shwtf7astlh9c2go80a",
    forGender: "man",
  },
  {
    id: "2120",
    name: "Tech Pack",
    slug: "tech-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/5v10ftyz1b6n2ogpxr55uvu38cb6",
    forGender: "woman",
  },
  {
    id: "2118",
    name: "Realtor Pack",
    slug: "realtor-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/oje8r4637eliyudc2h2tjkhl97hx",
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
    slug: "nurse-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/d1rf7zxusfjycly456lg4q4qlsnf",
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
    id: "2110",
    name: "Teacher Pack",
    slug: "teacher-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/1fag0h007euuxohe7t4coun1vw64",
    forGender: "man",
  },
  {
    id: "2103",
    name: "CEO / Entrepreneur Pack",
    slug: "ceo-entrepreneur-pack-man",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/559zjrizm166alers45p18mes3fl",
    forGender: "man",
  },
  {
    id: "2103",
    name: "CEO / Entrepreneur Pack",
    slug: "ceo-entrepreneur-pack-woman",
    exampleImg: "https://sdbooth2-production.s3.amazonaws.com/5e93txwt1omwn26b2zti91aw95rg",
    forGender: "woman",
  },
];

// ───── STARTER PACK (Standalone, not shown in themed list) ─────
export const starterPack: Pack = {
  id: "2033", // real Astria Pack ID
  name: "Starter Pack",
  slug: "starter-pack-man",
  exampleImg: "https://sdbooth2-production.s3.amazonaws.com/fdnkr2p8ws03s0kn7387wqrt0uva",
  forGender: "man",
};

// ───── DEV-ONLY TEST PACK ─────
const devOnlyTestPack: Pack = {
  id: "test-pack",
  name: "🧪 Test Pack (1 credit)",
  exampleImg: "/images/test-pack.png",
  forGender: "all",
};

// ───── BASE PACKS ─────
const basePacks: Pack[] = [
  {
    id: "base-pack-1",
    name: "Default Pack 1",
    exampleImg: "/images/base-pack-1.png",
    forGender: "all",
  },
  {
    id: "base-pack-2",
    name: "Default Pack 2",
    exampleImg: "/images/base-pack-2.png",
    forGender: "all",
  },
];

// ───── EXPORT ALL PACKS (base + placeholder + test) ─────
export const packs: Pack[] =
  process.env.NODE_ENV !== "production"
    ? [...placeholderPacks, ...basePacks, devOnlyTestPack]
    : [...placeholderPacks, ...basePacks];
