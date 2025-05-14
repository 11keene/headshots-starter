// File: data/packs.ts

export interface Pack {
  id: string;
  name: string;
  exampleImg: string;
  forGender: "woman" | "man" | "all";
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

// ───── YOUR EXISTING PACKS ─────
// (tag them forGender: "all")
const basePacks: Pack[] = [
  { id: "professional-headshots", name: "Professional Headshots", exampleImg: "/images/bob.png", forGender: "all" },
  { id: "bold-colors",            name: "Bold Colors",              exampleImg: "/images/bold-colors.png", forGender: "all" },
  { id: "realtor",                name: "Realtor Pack",            exampleImg: "/images/pixiecut.png", forGender: "all" },
  { id: "glamour",                name: "Glamour Shot",            exampleImg: "/images/straight.png", forGender: "all" },
  { id: "vikings",                name: "Vikings",                 exampleImg: "/images/pastshoulderlength.png", forGender: "all" },
  { id: "dating",                 name: "Dating",                  exampleImg: "/images/straight.png", forGender: "all" },
];

// ── placeholder Themed Packs ──
export const themedPacks: Pack[] = [
  {
    id: "themed-placeholder-woman",
    name: "Themed Pack 1 (Coming Soon)",
    exampleImg: "/images/placeholder-woman.png",
    forGender: "woman",
  },
  {
    id: "themed-placeholder-man",
    name: "Themed Pack 1 (Coming Soon)",
    exampleImg: "/images/placeholder-man.png",
    forGender: "man",
  },
];

// only in dev, append our Test Pack
const devOnlyTestPack: Pack = {
  id: "test-pack",
  name: "🧪 Test Pack (1 credit)",
  exampleImg: "/images/test-pack.png",
  forGender: "all",
};

// export the full list (if you still need it elsewhere)
export const packs: Pack[] =
  process.env.NODE_ENV !== "production"
    ? [...placeholderPacks, ...basePacks, devOnlyTestPack]
    : [...placeholderPacks, ...basePacks];
