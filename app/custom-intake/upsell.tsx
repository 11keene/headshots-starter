"use client";
import { useState } from "react";
import Link from "next/link";

// Your static packs array (or import it from data/packs.ts)
const packs = [
  { id: "j-crew", name: "J. Crew", exampleImg: "/packs/j-crew.jpg" },
  { id: "bold-colors", name: "Bold Colors", exampleImg: "/packs/bold-colors.jpg" },
  { id: "thumbnail", name: "YouTube Thumbnail Reaction", exampleImg: "/packs/youtube-thumbnail-reaction.jpg" },
  { id: "glamour", name: "Glamour Shot", exampleImg: "/packs/glamour-shot.jpg" },
  { id: "vikings", name: "Vikings", exampleImg: "/packs/vikings.jpg" },
  { id: "dating", name: "Dating", exampleImg: "/packs/dating.jpg" },
];

export default function CustomUpsellPage() {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 3;
  const visiblePacks = showAll ? packs : packs.slice(0, VISIBLE);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add More Packs?</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        {visiblePacks.map((pack) => (
          <div key={pack.id} className="relative border rounded-lg overflow-hidden">
            {/* Image */}
            <img
              src={pack.exampleImg}
              alt={pack.name}
              className="w-full h-40 object-cover"
            />

            {/* Black bottom overlay */}
            <div className="
              absolute 
              bottom-0 
              w-full 
              bg-black bg-opacity-80 
              flex items-center justify-center 
              h-10
              px-2
            ">
              <p className="text-white text-sm font-medium">
                {pack.name}
              </p>
            </div>

            {/* Add Pack button */}
            <Link
              href={`/checkout/add-pack?packId=${pack.id}`}
              className="
                absolute 
                top-2 right-2 
                bg-blue-600 text-white 
                text-xs font-medium 
                px-2 py-1 rounded
              "
            >
              Add Pack
            </Link>
          </div>
        ))}
      </div>

      {!showAll && packs.length > VISIBLE && (
        <button
          onClick={() => setShowAll(true)}
          className="mb-4 text-blue-600 hover:underline"
        >
          See More…
        </button>
      )}

      <Link
        href="/custom-intake/next"
        className="block text-center px-6 py-2 bg-green-600 text-white font-medium rounded"
      >
        Continue to Upload
      </Link>
    </div>
  );
}