"use client";

import { useState } from "react";
import Link from "next/link";
import { packs as allPacks } from "@/data/packs";      // ← new import
import type { Pack } from "@/data/packs";

export default function CustomUpsellPage() {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 3;
  
  // use the imported list (includes Test Pack in dev)
  const visiblePacks = showAll ? allPacks : allPacks.slice(0, VISIBLE);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add More Packs?</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        {visiblePacks.map((pack: Pack) => (
          <div key={pack.id} className="border rounded-lg overflow-hidden">
            <img
              src={pack.exampleImg}
              alt={pack.name}
              className="w-full h-48 object-cover"
            />
            <div className="bg-black text-white flex items-center justify-center text-center font-semibold py-2">
              {pack.name}
            </div>
            <div className="p-2 text-center">
              <Link
                href={`/checkout/add-pack?packId=${pack.id}`}
                className="mt-2 inline-block px-4 py-1 bg-blue-600 text-white rounded"
              >
                Add Pack
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!showAll && allPacks.length > VISIBLE && (
        <button
          onClick={() => setShowAll(true)}
          className="mb-4 text-charcoal hover:underline"
        >
          See More…
        </button>
      )}

      <Link
        href="/custom-intake/next"
        className="block text-center px-6 py-2 bg-dusty-coral/90 text-white font-medium rounded"
      >
        Continue to Upload
      </Link>
    </div>
  );
}
