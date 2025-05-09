// data/packs.ts

export interface Pack {
  id: string;
  name: string;
  exampleImg: string;
}

// your existing packs…
const basePacks: Pack[] = [
  { id: "professional-headshots", name: "Professional Headshots", exampleImg: "/images/bob.png" },
  { id: "bold-colors",            name: "Bold Colors",              exampleImg: "/images/bold-colors.png" },
  { id: "realtor",                name: "Realtor Pack",            exampleImg: "/images/pixiecut.png" },
  { id: "glamour",                name: "Glamour Shot",            exampleImg: "/images/straight.png" },
  { id: "vikings",                name: "Vikings",                 exampleImg: "/images/pastshoulderlength.png" },
  { id: "dating",                 name: "Dating",                  exampleImg: "/images/straight.png" },
];

// only in dev, append our Test Pack
const devOnlyTestPack: Pack = {
  id: "test-pack",
  name: "🧪 Test Pack (1 credit)",
  exampleImg: "/images/test-pack.png", // you can drop in any placeholder
};

export const packs: Pack[] =
  process.env.NODE_ENV !== "production"
    ? [...basePacks, devOnlyTestPack]
    : basePacks;
