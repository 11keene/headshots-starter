// data/packs.ts

export interface Pack {
    id: string;
    name: string;
    exampleImg: string;
  }
  
  export const packs: Pack[] = [
    { id: "professional-headshots",  name: "Professional Headshots",                         exampleImg: "/images/bob.png" },
    { id: "bold-colors", name: "Bold Colors",                exampleImg: "/images/bold-colors.png" },
    { id: "realtor",   name: "Realtor Pack",                     exampleImg: "/images/pixiecut.png" },
    { id: "glamour",     name: "Glamour Shot",               exampleImg: "/images/straight.png" },
    { id: "vikings",     name: "Vikings",                    exampleImg: "/images/pastshoulderlength.png" },
    { id: "dating",      name: "Dating",                     exampleImg: "/images/straight.png" },
  ];
  