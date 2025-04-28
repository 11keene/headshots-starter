// data/packs.ts

export interface Pack {
    id: string;
    name: string;
    exampleImg: string;
  }
  
  export const packs: Pack[] = [
    { id: "j-crew",  name: "J. Crew",                         exampleImg: "/packs/j-crew.jpg" },
    { id: "bold-colors", name: "Bold Colors",                exampleImg: "/packs/bold-colors.jpg" },
    { id: "thumbnail",   name: "YouTube Thumbnail Reaction", exampleImg: "/packs/youtube-thumbnail-reaction.jpg" },
    { id: "glamour",     name: "Glamour Shot",               exampleImg: "/packs/glamour-shot.jpg" },
    { id: "vikings",     name: "Vikings",                    exampleImg: "/packs/vikings.jpg" },
    { id: "dating",      name: "Dating",                     exampleImg: "/packs/dating.jpg" },
  ];
  