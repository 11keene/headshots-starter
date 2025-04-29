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
  const [activeTab, setActiveTab] = useState<"headshot" | "custom">(
    "headshot"
  );

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
      {/* 1. Heading */}
      <h1 className="text-2xl font-bold mb-4">
        Would you like to add additional photos?
      </h1>

      {/* 2. Top Controls: Back, Tabs, Continue */}
      <div className="flex items-center justify-between mb-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          Back
        </button>

        {/* Tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("headshot")}
            className={`px-6 py-2 rounded-t-md border-b-2 ${
              activeTab === "headshot"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-red-600"
            }`}
          >
            Add Additional Headshot
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-6 py-2 rounded-t-md border-b-2 ${
              activeTab === "custom"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-500 hover:text-red-600"
            }`}
          >
            Add Custom Photoshoot
          </button>
        </div>

        {/* Continue (only for headshot tab) */}
        {activeTab === "headshot" && (
          <button
            onClick={goContinue}
            disabled={selected.length === 0}
            className="px-6 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
          >
            Continue
          </button>
        )}
      </div>

      {/* 3. Content */}
      {activeTab === "headshot" ? (
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
              <div className="p-2 text-center font-semibold">
                {pack.name}
              </div>
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
