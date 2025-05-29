// components/OverviewClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";

type Tab = "custom";

const previewImages: Record<Tab, string[]> = {
  custom: [
    "/images/preview-custom-1.png",
    "/images/preview-custom-2.png",
    "/images/preview-custom-3.png",
    "/images/preview-custom-4.png",
  ],
};

interface OverviewClientProps {
  serverModels: any[];
  serverCredits: number;
}

export default function OverviewClient({
  serverModels,
  serverCredits,
}: OverviewClientProps) {
  const searchParams = useSearchParams();
  // We only ever have one tab now
  const tabParam = searchParams?.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam === "custom" ? "custom" : "custom");

  useEffect(() => {
    if (tabParam === "custom") {
      setActiveTab("custom");
    }
  }, [tabParam]);

  return (
    <div
      className="min-h-screen flex flex-col w-full pb-16"
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom), 16px) + 44px`,
      }}
    >
      {/* ─── Header + single Tab button ─── */}
      <div className="bg-ivory flex flex-col items-center w-full px-4 py-8">
        <div className="text-center mb-6 font-bold text-2xl text-charcoal">
          ⚡ Lightning-fast delivery – your headshots arrive in under an hour.
        </div>

        {/* Only one "Custom Pack" button now */}
        <div className="mt-8 mb-8 w-full max-w-lg grid grid-cols-1">
          <button
            onClick={() => setActiveTab("custom")}
            className={`
              text-base sm:text-lg font-semibold px-1 py-2 rounded-md transition
              ${activeTab === "custom"
                ? "text-Charcoal translate-y-[-2px] border-b-4 border-charcoal"
                : "text-muted-foreground hover:text-charcoal"}
            `}
          >
            Custom Pack
          </button>
        </div>
      </div>

      {/* ─── Custom Pack panel ─── */}
      {activeTab === "custom" && (
        <div className="bg-charcoal w-full max-w-xl p-6 rounded-lg shadow-md mb-20 mx-auto">
          <h2 className="text-2xl text-muted-gold font-bold mb-2 text-center">
            Custom Pack
          </h2>
          <p className="text-ivory text-sm text-center mb-8">
            Answer a few quick questions and get a fully bespoke photoshoot
            experience, crafted to your exact brand voice and vision.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <Link
              href={`/custom-intake?packType=custom&gender=woman`}
              className="w-full transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="overflow-hidden rounded-lg bg-white">
                <img
                  src="/images/placeholder-woman.png"
                  alt="Custom Pack for Woman"
                  className="block w-full"
                />
                <div className="bg-muted-gold h-6 flex items-center justify-center">
                  <span className="text-ivory text-sm">For Woman</span>
                </div>
              </div>
            </Link>
            <Link
              href="/custom-intake?gender=man"
              className="w-full transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="overflow-hidden rounded-lg bg-white">
                <img
                  src="/images/placeholder-man.png"
                  alt="Custom Pack for Man"
                  className="block w-full"
                />
                <div className="bg-muted-gold h-6 flex items-center justify-center">
                  <span className="text-ivory text-sm">For Man</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ─── Preview Images ─── */}
      <div className="bg-charcoal flex-1 w-full px-4 py-8 -mt-8 md:mt-0">
        <div className="max-w-6xl mx-auto mt-8">
          <h3 className="text-muted-gold font-semibold mb-8 text-center text-xl">
            Preview Images
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {previewImages[activeTab].map((src, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl shadow-xl pb-[150%] bg-charcoal"
              >
                <img
                  src={src}
                  alt={`${activeTab} preview ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ─── Models List ─── */}
        <div className="max-w-6xl mx-auto mt-8">
          <ClientSideModelsList serverModels={serverModels} />
        </div>
      </div>
    </div>
  );
}
