// File: components/OverviewClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";

interface OverviewClientProps {
  serverModels: any[];
  serverCredits: number;
}

type Tab = "starter" | "themed" | "custom";

export default function OverviewClient({
  serverModels,
  serverCredits,
}: OverviewClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam ?? "starter");

  // keep in sync if someone navigates with ?tab=…
  useEffect(() => {
    if (tabParam === "starter" || tabParam === "themed" || tabParam === "custom") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    // full-screen warm gray background
    <div className="min-h-screen bg-warm-gray flex flex-col items-center w-full px-4 py-8">
      {/* Tabs */}
      <div className="mt-8 mb-8 w-full max-w-lg grid grid-cols-3 gap-6">
        <button
          onClick={() => setActiveTab("starter")}
          className={`whitespace-nowrap text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "starter"
              ? "text-ivory translate-y-[-2px] border-b-4 border-charcoal"
              : "text-muted-foreground hover:text-charcoal"
          }`}
        >
          Starter Pack
        </button>
        <button
          onClick={() => setActiveTab("themed")}
          className={`whitespace-nowrap text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "themed"
              ? "text-ivory translate-y-[-2px] border-b-4 border-charcoal"
              : "text-muted-foreground hover:text-charcoal"
          }`}
        >
          Themed Packs
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`whitespace-nowrap text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "custom"
              ? "text-ivory translate-y-[-2px] border-b-4 border-charcoal"
              : "text-muted-foreground hover:text-charcoal"
          }`}
        >
          Custom Pack
        </button>
      </div>

      {/* Starter Pack Card */}
      {activeTab === "starter" && (
        <div className="bg-ivory w-full max-w-md p-6 rounded-lg shadow-md mb-20 flex flex-col items-center">
          <h2 className="text-2xl text-charcoal font-bold mb-2 text-center">
            Starter Pack
          </h2>
          <p className="text-charcoal text-sm text-center mb-8">
            A curated mini-shoot designed to deliver polished, professional images — fast. Ideal for updating your LinkedIn, profile picture, or personal brand.
          </p>
          <Link href="/overview/packs?type=starter" className="w-full">
            <img
              src="/images/curly.png"
              alt="Starter Pack"
              className="rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full"
            />
          </Link>
        </div>
      )}

      {/* Themed Packs Card */}
      {activeTab === "themed" && (
        <div className="bg-ivory w-full max-w-md p-6 rounded-lg shadow-md mb-20 flex flex-col items-center">
          <h2 className="text-2xl text-charcoal font-bold mb-2 text-center">
            Themed Packs
          </h2>
          <p className="text-charcoal text-sm text-center mb-8">
            Pick from our profession-specific themes—CEO, Teacher, Nurse, Realtor, Creative Professional, and more—for a fully tailored look.
          </p>
          <Link href="/overview/packs?type=themed" className="w-full">
            <img
              src="/images/themed.png"
              alt="Themed Packs"
              className="rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full"
            />
          </Link>
        </div>
      )}

      {/* Custom Pack Card */}
      {activeTab === "custom" && (
        <div className="bg-ivory w-full max-w-md p-6 rounded-lg shadow-md mb-20 flex flex-col items-center">
          <h2 className="text-2xl text-charcoal font-bold mb-2 text-center">
            Custom Pack
          </h2>
          <p className="text-charcoal text-sm text-center mb-8">
            Answer a few quick questions and get a fully bespoke photoshoot experience, crafted to your exact brand voice and vision.
          </p>
          <Link href="/custom-intake" className="w-full">
            <img
              src="/images/wavy.png"
              alt="Custom Pack"
              className="rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full"
            />
          </Link>
        </div>
      )}

      {/* Models List */}
      <div className="w-full max-w-6xl">
        <ClientSideModelsList serverModels={serverModels} />
      </div>
    </div>
  );
}
