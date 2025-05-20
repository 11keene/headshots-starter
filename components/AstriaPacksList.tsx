// components/AstriaPacksList.tsx
"use client";

import { useEffect, useState } from "react";

interface Pack {
  id: number;
  slug: string;
  title: string;
  public_at: string | null;
  cost_mc_hash: { man: number; woman: number };
}

export function AstriaPacksList() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    fetch("/api/astria/list-packs")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPacks(data);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!packs.length) return <div>Loading your packs…</div>;

  return (
    <ul className="space-y-4">
      {packs.map((p) => (
        <li key={p.id} className="p-4 border rounded-lg">
          <h3 className="text-lg font-bold">{p.title}</h3>
          <p className="text-sm text-gray-600">slug: {p.slug}</p>
          <p className="text-sm">
            {p.public_at ? "Public" : "Private"} — 
            ${(p.cost_mc_hash.man/100).toFixed(2)}/man, 
            ${(p.cost_mc_hash.woman/100).toFixed(2)}/woman
          </p>
        </li>
      ))}
    </ul>
  );
}
