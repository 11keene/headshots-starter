"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Pack } from "@/data/packs";
import { themedPacks } from "@/data/packs";

export default function ThemedSelection() {
  const searchParams = useSearchParams();
  const gender = (searchParams?.get("gender") as "woman" | "man") || "all";
  const router = useRouter();

  // only show the placeholders (and later real themes) for that gender
  const available = themedPacks.filter(
    (p: Pack) => p.forGender === gender
  );

  const handleClick = (packId: string) => {
    // go straight to your upsell page, carrying gender
    router.push(`/overview/packs/${packId}/upsell?gender=${gender}`);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <h2 className="text-center mb-4 text-lg font-medium">
        You chose: <strong>{gender === "woman" ? "Woman" : "Man"}</strong>
      </h2>
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        Pick your themed pack
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {available.map((p: Pack) => (
          <div
            key={p.id}
            onClick={() => handleClick(p.id)}
            className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              src={p.exampleImg}
              alt={p.name}
              className="w-full h-48 object-cover"
            />
            <div className="bg-muted-gold text-white text-center font-semibold py-2">
              {p.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
