// components/PricingClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Tier = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
};

const TIERS: Tier[] = [
  {
    id: "price_1RHmnVCs03tLUXoK4iTvnduW",
    title: "Starter",
    subtitle: "12 pics · 120 mins · 1 attire · SD res",
  },
  {
    id: "price_1RHmnnCs03tLUXoKLXWGbUqt",
    title: "Standard",
    subtitle: "60 pics · 60 mins · 2 attires · SD res",
    badge: "83% pick this",
  },
  {
    id: "price_1RHmo9Cs03tLUXoKiIai8D2O",
    title: "Pro",
    subtitle: "100 pics · 60 mins · All attires · HD res",
    badge: "Best Value",
  },
  {
    id: "price_1RHmoNCs03tLUXoKRpzgeqUu",
    title: "Studio",
    subtitle: "500 pics · 120 mins · Unlimited attires · 4K",
    badge: "Best Value",
  },
];

export default function PricingClient({
  packId,
  extraPacks,
}: {
  packId: string;
  extraPacks: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    console.log("💡 onContinue fired with:", { selected, extraPacks });
    if (!selected) return;
    setLoading(true);

    const extras = extraPacks ? extraPacks.split(",") : [];
    const priceIds = [selected, ...extras];

    try {
      const res = await fetch("/api/stripe/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceIds,
          successUrl: `${window.location.origin}/overview?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing?packId=${packId}&extraPacks=${extraPacks}`,
        }),
      });

      const text = await res.text();
      console.log("✅ /api/stripe/checkout/order response:", res.status, text);

      if (!res.ok) {
        console.error("🚨 bad response:", text);
        setLoading(false);
        return;
      }

      const { url } = JSON.parse(text);
      if (url) {
        window.location.href = url;
      } else {
        console.error("🚨 missing url in response:", text);
        setLoading(false);
      }
    } catch (err) {
      console.error("🚨 fetch failed:", err);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center text-gray-700 hover:text-black"
      >
        ← Go Back
      </button>

      <h1 className="text-3xl font-bold text-center mb-2">
        Amazing headshots are waiting for you!
      </h1>
      <p className="text-center text-gray-600 mb-8">
        We offer a package for every budget. Pay once, no subscriptions or hidden fees.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {TIERS.map((tier) => {
          const isActive = tier.id === selected;
          return (
            <div
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              className={`
                cursor-pointer rounded-lg border p-6 text-center transition-shadow
                ${isActive
                  ? "border-red-600 shadow-lg"
                  : "border-gray-200 hover:shadow-md"}
              `}
            >
              {tier.badge && (
                <span className="inline-block mb-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold">
                  {tier.badge}
                </span>
              )}
              <h2 className="text-xl font-semibold mb-1">{tier.title}</h2>
              <p className="text-gray-500 mb-4">{tier.subtitle}</p>
              {isActive && (
                <div className="mt-2 text-sm text-red-600 font-medium">
                  Selected
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center">
        <Button
          className="w-full sm:w-auto bg-red-600 text-white"
          disabled={!selected || loading}
          
          onClick={onContinue}
          isLoading={loading}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
