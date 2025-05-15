"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import type { Pack } from "../../../../../data/packs";
import { themedPacks, packs } from "../../../../../data/packs";

export default function HeadshotUpsell() {
  const paramsObj = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1) grab dynamic segments + query
  const packId = Array.isArray(paramsObj?.packId)
    ? paramsObj.packId[0]
    : paramsObj?.packId || "";
  const gender =
    (searchParams?.get("gender") as "woman" | "man") || "all";

  // detect custom flow
  const isCustom = packId === "defaultPack";
  const isStarter = packId === "starterPack"; // Define isStarter based on your logic

  // price calculation
  const originalPrice = 59.99;
  const discountedPrice = parseFloat((originalPrice * 0.8).toFixed(2));

  // determine if themed flow
  const isThemed = themedPacks.some(
    (p) => p.id === packId || p.slug === packId
  );

  // choose source list
  const sourceList = isThemed ? themedPacks : packs;

  // filter out the chosen pack
  const availableExtras = sourceList.filter((p) => {
    if (p.id === packId || p.slug === packId) return false;
    return isThemed ? p.forGender === gender || p.forGender === "all" : true;
  });

  // selection state
  const [selected, setSelected] = useState<string[]>([]);
  const togglePack = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // navigation
  const goContinue = () => {
    const extras = selected.join(",");
    router.push(
      `/overview/packs/${packId}/next?extraPacks=${extras}&gender=${gender}`
    );
  };

  const isSkip = selected.length === 0;

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      {/* show the choice */}
      <h2 className="text-center mb-6 text-lg font-medium">
        You chose: <strong>{gender === "woman" ? "Woman" : "Man"}</strong>
      </h2>

      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        Would you like to add additional photos?
      </h1>

      <div
        className={`flex mb-4 ${
          isCustom ? "justify-end" : "justify-between"
        }`}
      >
        {/* Back button for non-custom flows */}
        {!isCustom && (
          <button
            onClick={() => {
              if (isStarter) {
                // Starter: back to dashboard
                router.push("/overview");
              } else {
                // Themed: back to themed packs
                router.push(`/overview/packs/themed-selection?gender=${gender}`);
              }
            }}
            className="px-4 py-2 bg-muted-gold text-white rounded-md text-sm sm:text-base"
          >
            Back
          </button>
        )}

        <button
          onClick={goContinue}
          className={`px-4 py-2 rounded-md text-sm sm:text-base transition ${
            isSkip
              ? "bg-warm-gray/70 text-gray-800 hover:bg-warm-gray"
              : "bg-dusty-coral hover:bg-dusty-coral text-white"
          }`}
        >
          {isSkip ? "No Thanks" : "Continue"}
        </button>
      </div>

      {/* render gender-filtered extras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableExtras.map((p: Pack) => (
          <div
            key={p.id}
            onClick={() => togglePack(p.id)}
            className={`relative cursor-pointer border rounded-lg overflow-hidden transition-shadow ${
              selected.includes(p.id)
                ? "ring-4 ring-muted-gold shadow-lg"
                : "hover:shadow-md"
            }`}
          >
            <img
              src={p.exampleImg}
              alt={p.name}
              className="w-full h-100 object-cover"
            />

            {/* price badge */}
            <div className="absolute top-2 right-2 bg-warm-gray text-white text-xs font-semibold px-2 py-1 rounded text-right">
              <div className="line-through text-[10px]">
                ${originalPrice.toFixed(2)}
              </div>
              <div>${discountedPrice.toFixed(2)}</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-muted-gold text-white text-center font-semibold py-2">
              {p.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
