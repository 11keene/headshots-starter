"use client";

import { useRouter } from "next/navigation";
import { packs } from "../../../data/packs";

export default function PacksPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => router.push("/overview")}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Choose Your Headshot Pack</h1>
      <p className="text-muted-foreground mb-6">
        Click on a pack to continue.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <div
            key={pack.id}
            onClick={() =>
              // link into upsell on the CUSTOM tab by default
              router.push(`/overview/packs/${pack.id}/upsell?tab=custom`)
            }
            className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* ↑ bumped height from h-48 → h-56 */}
            <img
              src={pack.exampleImg}
              alt={pack.name}
              className="w-full h-100 sm:h-100 object-cover" // adjusted height of example photos
            />

            {/* ↓ thinner, fully centered caption bar */}
            <div className="
                bg-black
                text-white
                flex items-center justify-center
                text-center font-semibold
                py-2
              ">
              {pack.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
