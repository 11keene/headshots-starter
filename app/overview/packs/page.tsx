"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AstriaPack {
  id: number;
  slug: string;
  title: string;
  cover_url: string | null;
}

export default function PacksPage() {
  const router = useRouter();
  const [packs, setPacks]     = useState<AstriaPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string|null>(null);

  useEffect(() => {
    fetch("/api/astria/list-packs")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: AstriaPack[]) => setPacks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading packs…</div>;
  if (error)   return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-muted-gold/70 rounded-md"
      >
        Back
      </button>

      <h1 className="text-2xl text-charcoal font-bold mb-4">
        Choose Your Headshot Pack
      </h1>
      <p className="text-muted-foreground mb-6">
        Click on a pack to continue.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => {
          // decide which dashboard tab to open
          const tab = pack.slug === "starter-pack" ? "starter" : "themed";

          return (
            <div
              key={pack.id}
              onClick={() => router.push(`/overview?tab=${tab}`)}
              className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {pack.cover_url ? (
                <img
                  src={pack.cover_url}
                  alt={pack.title}
                  className="w-full h-100 object-cover"
                />
              ) : (
                <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                  No image
                </div>
              )}

              <div className="bg-muted-gold text-white text-center font-semibold py-4">
                {pack.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
