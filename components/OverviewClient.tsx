// components/OverviewClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";

interface OverviewClientProps {
  serverModels: any[];
  serverCredits: number;
}

export default function OverviewClient({
  serverModels,
  serverCredits,
}: OverviewClientProps) {
  const [activeTab, setActiveTab] = useState<"headshot" | "custom">("headshot");

  return (
    <div className="flex flex-col items-center w-full px-4">
      {/* Display user credits */}
      <div className="w-full flex justify-end mb-4">
        <span className="text-sm text-gray-500">Credits:</span>
        <span className="ml-2 text-lg font-semibold">{serverCredits}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mt-8 mb-8">
        <button
          onClick={() => setActiveTab("headshot")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "headshot"
              ? "text-black translate-y-[-2px] border-b-4 border-red-500"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          Choose a Headshot
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition ${
            activeTab === "custom"
              ? "text-black translate-y-[-2px] border-b-4 border-red-500"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          Custom Photoshoot
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "headshot" && (
        <div className="flex flex-col items-center w-full max-w-md mb-20">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Choose Your Headshot
          </h2>
          <p className="text-muted-foreground mb-8 text-center">
            Click to choose from our different pack styles.
          </p>
          <Link href="/overview/packs" className="w-full">
            <img
              src="/images/curly.png"
              alt="Choose a Headshot"
              className="rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full"
            />
          </Link>
        </div>
      )}

      {activeTab === "custom" && (
        <div className="flex flex-col items-center w-full max-w-md mb-20">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Choose Your Custom Style
          </h2>
          <p className="text-muted-foreground mb-8 text-center">
            Generate more personalized and customizable images.
          </p>
          <Link href="/custom-intake" className="w-full">
            <img
              src="/images/wavy.png"
              alt="Custom Photoshoot"
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
