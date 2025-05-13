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
  // get the `tab` param (will be "starter" | "themed" | "custom")
  const tabParam = searchParams?.get("tab") as Tab | null;

  // initialize to URL param if present, otherwise default to "starter"
  const [activeTab, setActiveTab] = useState<Tab>(tabParam ?? "starter");

  // in case the query-param changes (i.e. via client navigation), re-sync
  useEffect(() => {
    if (tabParam === "starter" || tabParam === "themed" || tabParam === "custom") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="flex flex-col items-center w-full px-4">
      {/* Tabs */}
      <div className="flex gap-6 mt-8 mb-8">
        <button
          onClick={() => setActiveTab("starter")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "starter"
              ? "text-charcoal translate-y-[-2px] border-b-4 border-muted-gold"
              : "text-muted-foreground hover:text-charcoal"
          }`}
        >
          Starter Pack
        </button>
        <button
          onClick={() => setActiveTab("themed")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "themed"
              ? "text-charcoal translate-y-[-2px] border-b-4 border-muted-gold"
              : "text-muted-foreground hover:text-charcoal"
          }`}
        >
          Themed Packs
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "custom"
              ? "text-charcoal translate-y-[-2px] border-b-4 border-muted-gold"
              : "text-muted-foreground hover:text-charcoal"
          }`}
        >
          Custom Pack
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "starter" && (
        <div className="flex flex-col items-center w-full max-w-md mb-20">
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

      {activeTab === "themed" && (
        <div className="flex flex-col items-center w-full max-w-md mb-20">
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

      {activeTab === "custom" && (
        <div className="flex flex-col items-center w-full max-w-md mb-20">
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
