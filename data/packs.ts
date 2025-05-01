// data/packs.ts

export interface Pack {
    id: string;
    name: string;
    exampleImg: string;
  }
  
  export const packs: Pack[] = [
    { id: "j-crew",  name: "J. Crew",                         exampleImg: "/images/bob.png" },
    { id: "bold-colors", name: "Bold Colors",                exampleImg: "/images/bold-colors.jpg" },
    { id: "thumbnail",   name: "YouTube Thumbnail Reaction", exampleImg: "/images/pixiecut.png" },
    { id: "glamour",     name: "Glamour Shot",               exampleImg: "/images/straight.png" },
    { id: "vikings",     name: "Vikings",                    exampleImg: "/images/pasthoulderlength.png" },
    { id: "dating",      name: "Dating",                     exampleImg: "/images/straight.png" },
  ];
  