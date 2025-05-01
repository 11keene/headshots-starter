"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Pack } from "../../../../../data/packs";
import { packs } from "../../../../../data/packs";

export default function HeadshotUpsell() {
  const { packId } = useParams();
  const router = useRouter();
  const params = useSearchParams();

  // if someone links here with ?tab=custom, open custom tab; else headshot
  const initialTab = params.get("tab") === "custom" ? "custom" : "headshot";
  const [activeTab, setActiveTab] = useState<"headshot" | "custom">(initialTab);

  // headshot‐add selections
  const [selected, setSelected] = useState<string[]>([]);
  // custom‐add selected?
  const [customSelected, setCustomSelected] = useState(false);

  const togglePack = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // always push to the NEXT/upload step
  const goContinue = () => {
    const extra = selected.join(",");
    router.push(`/overview/packs/${packId}/next?extraPacks=${extra}`);
  };

  // send into first intake form, telling it we came from HEADSHOT flow
  const goCustom = () => {
    router.push(
      `/custom-intake?packId=${packId}&from=headshot`
    );
  };

  // show "No Thanks" if nothing picked
  const isSkip =
    activeTab === "headshot" ? selected.length === 0 : !customSelected;

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      {/* heading */}
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        Would you like to add additional photos?
      </h1>

      {/* back + continue/no-thanks */}
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
            onClick={ activeTab === "headshot" ? goContinue : goCustom }
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm sm:text-base transition"
          >
            Continue
          </button>
        )}
      </div>

      {/* tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab("headshot")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "headshot"
              ? "text-black translate-y-[-2px] border-b-4 border-red-500"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          Select Additional Headshots
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "custom"
              ? "text-black translate-y-[-2px] border-b-4 border-red-500"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          Select Custom Photoshoot
        </button>
      </div>

      {/* content */}
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
              {/* ↑ wrapper for the image + caption bar */}
              <div className="relative overflow-hidden">
                <img
                  src={p.exampleImg}
                  alt={p.name}
                  className="w-full h-100 sm:h-100 object-cover"
                />
                {/* ↓ black caption bar */}
                <div className="
                  absolute left-0 right-0 bottom-0
                  bg-black text-white
                  flex items-center justify-center
                  text-center font-semibold
                  py-2
                ">
                  {p.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <div
            onClick={() => setCustomSelected(true)}
            className={`cursor-pointer border rounded-lg overflow-hidden shadow-md max-w-sm w-full ${
              customSelected ? "ring-4 ring-red-500" : ""
            }`}
          >
            <div className="relative overflow-hidden">
              <img
                src="/images/straight.png"
                alt="Custom Photoshoot"
                className="w-full h-100 sm:h-100 object-cover"
              />
              {/* ↓ black caption bar */}
              <div className="
                absolute left-0 right-0 bottom-0
                bg-black text-white
                flex items-center justify-center
                text-center font-semibold
                py-2
              ">
                Custom Photoshoot
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
