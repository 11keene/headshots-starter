// app/overview/packs/[packId]/upsell/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { packs } from "../../../../../data/packs"; // adjust if your data folder is elsewhere

export default function HeadshotUpsell() {
  const { packId } = useParams();
  const router = useRouter();

  // track which packs the user has clicked
  const [selected, setSelected] = useState<string[]>([]);

  const togglePack = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const goCustom = () => {
    router.push("/custom-intake");
  };

  const goContinue = () => {
    // pass the extra packs as a query param to the upload step
    const extra = selected.join(",");
    router.push(`/overview/packs/${packId}/next?extraPacks=${extra}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Select Additional Packs</h1>
      <p className="text-muted-foreground mb-6">
        Click on any packs below to add them to your headshot order.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div
            key={pack.id}
            onClick={() => togglePack(pack.id)}
            className={`
              cursor-pointer 
              border rounded-lg overflow-hidden 
              transition-shadow
              ${selected.includes(pack.id) 
                ? "ring-4 ring-blue-500 shadow-lg" 
                : "hover:shadow-md"
              }
            `}
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

      <div className="mt-8 flex flex-col gap-4">
        <button
          onClick={goCustom}
          className="w-full px-6 py-2 bg-purple-600 text-white rounded-md"
        >
          Add a Custom Photoshoot
        </button>
        <button
          onClick={goContinue}
          disabled={selected.length === 0}
          className="w-full px-6 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
        >
          Continue
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Or choose another pack
        </p>
      </div>
    </div>
);
}

