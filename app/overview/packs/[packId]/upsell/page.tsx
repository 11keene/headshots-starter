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
  const [activeTab, setActiveTab] = useState<"headshot" | "custom">("headshot");

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
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      {/* 1. Heading */}
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        Would you like to add additional photos?
      </h1>

      {/* 2. Top Controls: Back & Continue */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-black text-white rounded-md text-sm sm:text-base"
        >
          Back
        </button>
        <button
          onClick={goContinue}
          disabled={selected.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm sm:text-base disabled:opacity-50"
        >
          Continue
        </button>
      </div>

      {/* 3. Tabs (overview styling) */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab("headshot")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "headshot"
              ? "text-black translate-y-[-2px] border-b-4 border-red-500"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          Add Additional Headshot
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "custom"
              ? "text-black translate-y-[-2px] border-b-4 border-red-500"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          Add Custom Photoshoot
        </button>
      </div>

      {/* 4. Content */}
      {activeTab === "headshot" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((p: Pack) => (
            <div
              key={p.id}
              onClick={() => togglePack(p.id)}
              className={`cursor-pointer border rounded-lg overflow-hidden transition-shadow ${
                selected.includes(p.id)
                  ? "ring-4 ring-blue-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              <img
                src={p.exampleImg}
                alt={p.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-2 text-center font-semibold">{p.name}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <div
            onClick={goCustom}
            className="cursor-pointer border rounded-lg overflow-hidden shadow-md max-w-sm w-full"
          >
            <img
              src="/your-custom-example.jpg"
              alt="Custom Photoshoot"
              className="w-full h-64 object-cover"
            />
            <div className="p-4 text-center font-semibold">
              Custom Photoshoot
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
