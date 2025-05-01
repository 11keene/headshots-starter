"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";  // ← NEW

type Tier = {
  id: string;        // your Stripe Price ID
  title: string;
  subtitle: string;  // e.g. "40 pics · 120 mins · 1 attire · SD res"
  badge?: string;
};

const TIERS: Tier[] = [
  { id: "price_1RJLBd4RnIZz7j08beYwRGv1", title: "Starter", subtitle: "12 pics · 120 mins · 1 attire · SD res" },
  { id: "price_1RJLCO4RnIZz7j08tJ3vN1or", title: "Standard", subtitle: "60 pics · 60 mins · 2 attires · SD res", badge: "83% pick this" },
  { id: "price_1RJLDE4RnIZz7j08RlQUve2s", title: "Pro", subtitle: "100 pics · 60 mins · All attires · HD res", badge: "Best Value" },
  { id: "price_1RJLDf4RnIZz7j08TLcrNcQ6", title: "Studio", subtitle: "500 pics · 120 mins · Unlimited attires · 4K" },
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
    if (!selected) return;
    setLoading(true);

    const extras = extraPacks ? extraPacks.split(",") : [];
    const priceIds = [selected, ...extras];
    console.log("💡 onContinue fired with:", { selected, extraPacks, priceIds });

    try {
      const res = await fetch(
        `${window.location.origin}/api/stripe/checkout/order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceIds,
            successUrl: `${window.location.origin}/overview/packs/${packId}/generate?extraPacks=${extraPacks}&session_id={CHECKOUT_SESSION_ID}`, 
            cancelUrl: `${window.location.origin}/pricing?packId=${packId}&extraPacks=${extraPacks}`,
          }),
        }
      );

      const json = await res.json();
      console.log("💬 checkout/order response:", json);

      if (json.url) {
        window.location.href = json.url;
      } else {
        console.error("Checkout session creation failed:", json);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error calling checkout/order:", err);
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

      <h1 className="text-3xl font-bold text-center mb-2 text-black-500">
        Amazing headshots are waiting for you!
      </h1>
      <p className="text-center text-gray-600 mb-8">
        We offer a package for every budget. Pay once, no subscriptions or hidden fees.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {TIERS.map((tier) => {
          const isActive = tier.id === selected;
          return (
            <div
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              className={`
                h-[220px] flex flex-col justify-between
                cursor-pointer rounded-lg border p-6 text-center transition-shadow
                ${isActive
                  ? "border-red-600 shadow-lg"
                  : "border-black-500 hover:shadow-md"
                }`}
            >
              {/* Fixed badge container height */}
              <div className="h-[24px] mb-2">
                {tier.badge && (
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold">
                    {tier.badge}
                  </span>
                )}
              </div>

              {/* Title with updated color */}
              <h2 className="text-xl font-semibold mb-1 text-red-700">
                {tier.title}
              </h2>

              <p className="text-gray-500 mb-4">{tier.subtitle}</p>

              {isActive && (
                <div className="text-sm text-red-600 font-medium">
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
