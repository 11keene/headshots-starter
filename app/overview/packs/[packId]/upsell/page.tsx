"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Pack } from "../../../../../data/packs";
import { packs } from "../../../../../data/packs";

export default function HeadshotUpsell() {
  const paramsObj = useParams();
  const packId = Array.isArray(paramsObj?.packId)
  ? paramsObj.packId[0]
  : paramsObj?.packId || "";
  const router = useRouter();
  const params = useSearchParams();

  // start on whichever tab
  const initialTab = params?.get("tab") === "custom" ? "custom" : "headshot";
  const [activeTab, setActiveTab] = useState<"headshot" | "custom">(initialTab);

  // headshot extra‐packs (multi‐select)
  const [selected, setSelected] = useState<string[]>([]);
  const togglePack = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // custom photoshoot select/deselect
  const [customSelected, setCustomSelected] = useState(false);
  const toggleCustom = () => setCustomSelected((prev) => !prev);

  // navigation handlers
  const goContinue = () => {
    const extras = selected.join(",");
    router.push(`/overview/packs/${packId}/next?extraPacks=${extras}`);
  };
  const goCustom = () => {
    router.push(`/custom-intake?packId=${packId}&from=headshot`);
  };

  // if nothing chosen, show “No Thanks”
  const isSkip =
    activeTab === "headshot" ? selected.length === 0 : !customSelected;

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        Would you like to add additional photos?
      </h1>

      <div className="flex justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-black text-white rounded-md text-sm sm:text-base"
        >
          Back
        </button>

        {isSkip ? (
          <button
            onClick={goContinue}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm sm:text-base hover:bg-gray-300 transition"
          >
            No Thanks
          </button>
        ) : (
          <button
            onClick={activeTab === "headshot" ? goContinue : goCustom}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm sm:text-base transition"
          >
            Continue
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab("headshot")}
          className={`px-4 py-2 font-semibold rounded-md transition ${
            activeTab === "headshot"
              ? "text-black border-b-4 border-red-500"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          Select Additional Headshots
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-4 py-2 font-semibold rounded-md transition ${
            activeTab === "custom"
              ? "text-black border-b-4 border-red-500"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          Select Custom Photoshoot
        </button>
      </div>

      {/* Content */}
      {activeTab === "headshot" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((p: Pack) => (
            <div
              key={p.id}
              onClick={() => togglePack(p.id)}
              className={`cursor-pointer border rounded-lg overflow-hidden transition-shadow ${
                selected.includes(p.id)
                  ? "ring-4 ring-red-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              <img
                src={p.exampleImg}
                alt={p.name}
                className="w-full h-100 object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black text-white text-center font-semibold py-2">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <div
            onClick={toggleCustom}
            className={`cursor-pointer border rounded-lg overflow-hidden shadow-md max-w-sm w-full ${
              customSelected ? "ring-4 ring-red-500" : ""
            }`}
          >
            <img
              src="/images/straight.png"
              alt="Custom Photoshoot"
              className="w-full h-100 object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-black text-white text-center font-semibold py-2">
              Custom Photoshoot
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
