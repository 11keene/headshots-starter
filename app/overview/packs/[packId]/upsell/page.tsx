// app/overview/packs/[packId]/upsell/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Pack } from "../../../../../data/packs";
import { packs } from "../../../../../data/packs";

export default function HeadshotUpsell() {
  const { packId } = useParams();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const togglePack = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const goContinue = () => {
    const extra = selected.join(",");
    router.push(`/overview/packs/${packId}/next?extraPacks=${extra}`);
  };

  const goCustom = () => {
    router.push("/custom-intake");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Back
        </button>
        <div className="flex space-x-4">
          <button
            onClick={goCustom}
            className="px-6 py-2 bg-purple-600 text-white rounded-md"
          >
            Add a Custom Photoshoot
          </button>
          <button
            onClick={goContinue}
            disabled={selected.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack: Pack) => (
          <div
            key={pack.id}
            onClick={() => togglePack(pack.id)}
            className={`cursor-pointer border rounded-lg overflow-hidden transition-shadow ${
              selected.includes(pack.id)
                ? "ring-4 ring-blue-500 shadow-lg"
                : "hover:shadow-md"
            }`}
          >
            <img
              src={pack.exampleImg}
              alt={pack.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-2 text-center font-semibold">{pack.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}