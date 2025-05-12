// File: components/PricingClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";

type Tier = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
};

const TIERS: Tier[] = [
  {
    id: "price_1RJLBd4RnIZz7j08beYwRGv1",
    title: "Starter",
    subtitle: "12 pics · 120 mins · 1 attire · SD res",
  },
  {
    id: "price_1RJLCO4RnIZz7j08tJ3vN1or",
    title: "Standard",
    subtitle: "60 pics · 60 mins · 2 attires · SD res",
    badge: "83% pick this",
  },
  {
    id: "price_1RJLDE4RnIZz7j08RlQUve2s",
    title: "Pro",
    subtitle: "100 pics · 60 mins · All attires · HD res",
    badge: "Best Value",
  },
  {
    id: "price_1RJLDf4RnIZz7j08TLcrNcQ6",
    title: "Studio",
    subtitle: "500 pics · 120 mins · Unlimited attires · 4K",
  },
];

export default function PricingClient({
  packId,
  extraPacks,
}: {
  packId: string;       // your packs.id (UUID)
  extraPacks: string;   // comma-separated extra price IDs
}) {
  const router   = useRouter();
  const session  = useSession();
  const userId   = session?.user.id ?? "";
  const userEmail = session?.user.email ?? "";
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const onContinue = async () => {
    if (!selected) {
      console.warn("⚠️ No plan selected");
      return;
    }
    if (!userId) {
      console.warn("⚠️ No user logged in");
      return;
    }
    if (!userEmail) {
      console.warn("⚠️ No email available on session");
      return;
    }

    setLoading(true);

    // turn the extraPacks query-param into an array
    const extrasArray = extraPacks
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    // the exact shape your API now expects:
    const payload = {
      packId,                   // → orders.pack_id FK (UUID)
      stripePriceId: selected,  // → which Stripe price you’re charging
      user_id: userId,          // → orders.user_id FK (UUID)
      user_email: userEmail,    // → satisfy users.email not-null constraint
      extras: extrasArray,      // optional additional price IDs
    };

    console.log("💡 [PricingClient] create-session payload:", payload);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: packId,               // <-- from the component props
          stripePriceId: selected,      // <-- the Stripe price the user clicked
          user_id: userId,              // <-- from useSession()
          user_email: userEmail,        // <-- also from useSession()
          extras: extrasArray,          // <-- your extras array
        }),
      });

      const json = await res.json();
      console.log("💬 create-checkout-session response:", json);

      if (json.url) {
        window.location.href = json.url;
      } else {
        console.error("❌ no URL returned:", json.error || json);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error calling create-checkout-session:", err);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
       onClick={() =>
        router.push(
            `/overview/packs/${packId}/next${extraPacks ? `?extraPacks=${extraPacks}` : ""}`
          )
        }
        className="mb-6 inline-flex items-center text-gray-700 hover:text-charcoal"
     >
       ← Go Back
      </button>

      <h1 className="text-3xl font-bold text-center mb-2 text-charcoal-500">
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
                  ? "border-dusty-coral shadow-lg"
                  : "border-black-500 hover:shadow-md"}
              `}
            >
              <div className="h-[24px] mb-2">
                {tier.badge && (
                  <span className="inline-block rounded-full bg-dusty-coral px-3 py-1 text-xs font-semibold">
                    {tier.badge}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-semibold mb-1 text-dusty-coral">
                {tier.title}
              </h2>

              <p className="text-gray-500 mb-4">{tier.subtitle}</p>

              {isActive && (
                <div className="text-sm text-dusty-coral font-medium">Selected</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-ivoryborder-t p-4 flex justify-center">
        <Button
          className="w-full sm:w-auto bg-dusty-coral text-white"
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
