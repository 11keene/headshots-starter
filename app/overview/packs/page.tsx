"use client";

import Link from "next/link";
import React from "react";

// 1. Your static pack definitions (replace `/packs/...` with your real image paths)
const packs = [
  { id: "j-crew", name: "J. Crew", exampleImg: "/packs/j-crew.jpg" },
  { id: "bold-colors", name: "Bold Colors", exampleImg: "/packs/bold-colors.jpg" },
  { id: "thumbnail", name: "YouTube Thumbnail Reaction", exampleImg: "/packs/youtube-thumbnail-reaction.jpg" },
  { id: "glamour", name: "Glamour Shot", exampleImg: "/packs/glamour-shot.jpg" },
  { id: "vikings", name: "Vikings", exampleImg: "/packs/vikings.jpg" },
  { id: "dating", name: "Dating", exampleImg: "/packs/dating.jpg" },
];

export default function PacksPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Choose Your Headshot Pack</h1>
      <p className="text-muted-foreground mb-6">Select your base pack, then you’ll be able to add more on the next page.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className="flex flex-col bg-white rounded-lg shadow overflow-hidden"
          >
            <img
              src={pack.exampleImg}
              alt={pack.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex flex-col items-center gap-3">
              <h2 className="font-semibold">{pack.name}</h2>
              {/* ◀ Here’s the link you need: */}
              <Link href={`/overview/packs/${pack.id}/upsell`}>
                <button className="px-4 py-2 bg-red-500 text-white rounded">
                  Select this pack
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
