"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { themedPacks, type Pack } from "@/data/packs";

type AstriaPack = {
  id: number;
  slug: string;
  title: string;
  cover_url: string | null;
};

export default function ThemedSelection() {
  const searchParams = useSearchParams();
  const gender = (searchParams?.get("gender") as "woman" | "man") || "all";
  const router = useRouter();

  // 1) fetch Astria packs
  const [astriaPacks, setAstriaPacks] = useState<AstriaPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/astria/list-packs")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return res.json() as Promise<AstriaPack[]>;
      })
      .then(setAstriaPacks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // 2) filter local themedPacks by gender
  const filteredLocal = themedPacks.filter(
    (p: Pack) => p.forGender === gender || p.forGender === "all"
  );

  // 3) merge with Astria data (use cover_url if available)
  const available = filteredLocal.map((p) => {
    const ap = astriaPacks.find((a) => a.slug === p.slug);
    return {
      ...p,
      exampleImg: ap?.cover_url ?? p.exampleImg,
    };
  });

  const handleClick = (slug: string) => {
    router.push(`/overview/packs/${slug}/upsell?gender=${gender}`);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading…</div>;
  }
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading packs: {error}
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <h2 className="text-center mb-4 text-lg font-medium">
        You chose: <strong>{gender === "woman" ? "Woman" : "Man"}</strong>
      </h2>
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        Pick Your Themed Pack
      </h1>

      {available.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No themed packs are available yet for this gender.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {available.map((p: Pack) => (
            <div
              key={p.slug}
              onClick={() => handleClick(p.slug ?? "")}
              className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <img
                src={p.exampleImg}
                alt={p.name}
                className="w-full h-100 object-cover"
              />
              <div className="bg-muted-gold text-white text-center font-semibold py-2">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}