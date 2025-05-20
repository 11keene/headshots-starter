// File: app/overview/packs/[packId]/upsell/headshot/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import type { Pack } from "../../../../../data/packs";
import {
  starterPacks,
  themedPacks,
  packs,
  customPacks,
} from "../../../../../data/packs";

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

  // detect custom flow by looking in your customPacks array
  const isCustom = customPacks.some(
    (p) => p.id === packId || p.slug === packId
  );



  // detect starter flow
  const isStarter = starterPacks.some(
    (p) => p.id === packId || p.slug === packId
  );

  // price calculation for themed-pack upsell
  const originalPrice = 42.99;
  const discountedPrice = parseFloat(
    (originalPrice * 0.9).toFixed(2)
  ); // 10% off

  // determine if themed flow
  const themedKeys = themedPacks.flatMap((p) => [p.id, p.slug]);
  const isThemed = themedKeys.includes(packId);

  // choose source list — treat custom exactly like themed/starter
  const sourceList = (isThemed || isStarter || isCustom)
    ? themedPacks
    : packs;
    // ─── DEBUG LOGGING ───
console.log("⚙️ packId:", packId);
 console.log("⚙️ isThemed:", isThemed, "isStarter:", isStarter, "isCustom:", isCustom);
 console.log("⚙️ sourceList keys:", sourceList.map(p => p.slug || p.id));
 
  // filter out the chosen pack, and for themed or starter flows only show matching genders
  const availableExtras = sourceList
    .filter(p => p.id !== packId && p.slug !== packId)
    .filter(p => p.forGender === gender || p.forGender === "all");

 console.log("⚙️ availableExtras:", availableExtras.map(p => p.slug || p.id));


  // selection state
  const [selected, setSelected] = useState<string[]>([]);
  const togglePack = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // navigation
  const goContinue = () => {
    const extras = selected.join(",");
    const checkoutSlug = isCustom
      ? `custom-intake-${gender}`
      : packId;

    router.push(
      `/overview/packs/${checkoutSlug}/next?extraPacks=${extras}&gender=${gender}`
    );
  };

  const isSkip = selected.length === 0;

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      {/* show the choice */}
      <h2 className="text-center mb-6 text-lg font-medium">
        You chose:{" "}
        <strong>{gender === "woman" ? "Woman" : "Man"}</strong>
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
            onClick={() => router.back()}
            className="px-4 py-2 bg-muted-gold text-white rounded-md text-sm sm:text-base"
          >
            Back
          </button>
        )}

        <button
          onClick={goContinue}
          className={`px-4 py-2 rounded-md text-sm sm:text-base transition ${
            isSkip
              ? "bg-warm-gray/70 text-white hover:bg-warm-gray"
              : "bg-muted-gold hover:bg-muted-gold text-white"
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
