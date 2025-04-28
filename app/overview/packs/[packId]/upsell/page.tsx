"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { packs } from "../../../../../data/packs";

export default function HeadshotUpsell() {
  const { packId } = useParams();
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 3;
  const visiblePacks = showAll ? packs : packs.slice(0, VISIBLE);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Add a Custom Photoshoot?</h1>
      <p className="mb-4">Upsell extra creative packs to your headshot order.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        {visiblePacks.map((p) => (
          <div key={p.id} className="border rounded-lg overflow-hidden">
            <img
              src={p.exampleImg}
              alt={p.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-2 text-center">
              <p className="font-semibold">{p.name}</p>
              <Link
                href={`/overview/packs/${packId}/intake?addPack=${p.id}`}
                className="mt-2 inline-block px-4 py-1 bg-blue-600 text-white rounded"
              >
                Add Pack
              </Link>
            </div>
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
        href={`/overview/packs/${packId}/next`}
        className="block text-center px-6 py-2 bg-green-600 text-white font-medium rounded"
      >
        Continue
      </Link>
    </div>
  );
}

