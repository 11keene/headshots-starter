// File: app/checkout/[packId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CheckoutPage() {
  const router = useRouter();
  const { packId: _packId } = useParams();
  const packId = Array.isArray(_packId) ? _packId[0] : _packId || "";
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [packType, setPackType] = useState<"headshots" | "multi-purpose">("headshots");

  useEffect(() => {
    // 1) Get the logged-in user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || null);
      } else {
        setError("You must be logged in to checkout.");
      }
    });

    // 2) Fetch pack_type from Supabase for this packId
    (async () => {
      const { data: packRow, error: packErr } = await supabase
        .from("packs")
        .select("pack_type")
        .eq("id", packId)
        .single();

      if (packErr || !packRow) {
        setError("Pack not found.");
      } else {
        setPackType(packRow.pack_type as "headshots" | "multi-purpose");
      }
    })();
  }, [packId, supabase]);

  const startCheckout = async () => {
    if (!userId || !userEmail) return;
    setLoading(true);
    setError(null);

    // Map packType to your Stripe Price IDs (from .env.local)
    const stripePriceId =
      packType === "headshots"
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_HEADSHOTS!
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MULTI!;

    try {
      const resp = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripePriceId,
          packType,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Error during checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <button
        onClick={startCheckout}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Redirecting to Stripe…" : "Pay Now"}
      </button>
    </div>
  );
}
