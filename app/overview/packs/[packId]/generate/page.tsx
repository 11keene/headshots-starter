// app/overview/packs/[packId]/generate/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function GeneratePage() {
  const params = useParams();
  const packId = Array.isArray(params?.packId)
    ? params.packId[0]
    : params?.packId || "";  const searchParams = useSearchParams();
  const extraPacks = searchParams?.get("extraPacks") || "";

  useEffect(() => {
    // pull stored upload URLs
    const uploaded: string[] =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem(`uploads-${packId}`) || "[]")
        : [];

    // fire off your Astria training request
    fetch("/astria/train-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: uploaded,
        type: "headshot",
        pack: packId,
        name: `Headshot Pack ${packId}`,
        characteristics: extraPacks ? extraPacks.split(",") : [],
      }),
    }).catch((err) => {
      // you may want to log this server-side instead
      console.error("Training request failed:", err);
    });
  }, [packId, extraPacks]);

  return (
    <div className="p-8 text-center">
      <Spinner />
      <h1 className="text-2xl font-bold mt-6 mb-2">Order Processed!</h1>
      <p className="mb-1">Thank you for your purchase.</p>
      <p className="text-gray-600">
        Your images are now being generated. Please keep an eye on your inbox—we’ll
        email you as soon as they’re ready.
      </p>
    </div>
  );
}
