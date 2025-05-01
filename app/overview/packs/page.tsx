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
              router.push(`/overview/packs/${pack.id}/upsell?tab=custom`)
            }
            className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={pack.exampleImg}
              alt={pack.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-center font-semibold">{pack.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
