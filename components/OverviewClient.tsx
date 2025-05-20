// File: components/OverviewClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";
import { starterPacks, themedPacks } from "@/data/packs";  // adjust the path as needed

type Tab = "starter" | "themed" | "custom";

const previewImages: Record<Tab, string[]> = {
  starter: [
    "https://sdbooth2-production.s3.amazonaws.com/lrb9lvlbjgizje1x7n34e8g3jp04",
    "https://sdbooth2-production.s3.amazonaws.com/77ku35w88wheco08w6nrt88ivwur",
    "https://sdbooth2-production.s3.amazonaws.com/muto4bff9dbtumlry5kklhxryili",
    "https://sdbooth2-production.s3.amazonaws.com/qofmoq4oi5q5j9z0z4qloxjr2934",
  ],
  themed: [
    "https://sdbooth2-production.s3.amazonaws.com/lmem6kdn8sdllu4yhuyfgddbo84p",
    "https://sdbooth2-production.s3.amazonaws.com/vmr1fsliv2rkz7rp8dogi0qu392l",
    "https://sdbooth2-production.s3.amazonaws.com/bem7gfdekphucxwnulbavb8phbq5",
    "https://sdbooth2-production.s3.amazonaws.com/hry9rxrc68kxcjz0zno6tfgewxpa",
  ],
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
  const tabParam = searchParams?.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam ?? "themed");

  // keep in sync if someone navigates with ?tab=…
  useEffect(() => {
    if (
      tabParam === "starter" ||
      tabParam === "themed" ||
      tabParam === "custom"
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <>
 
    <div
        className="min-h-screen flex flex-col w-full pb-16" // fallback padding for URL bar
        style={{
          // env(safe-area-inset-bottom) handles the home-indicator;
          // + 44px (approx) makes room for the Safari toolbar
          paddingBottom: `max(env(safe-area-inset-bottom), 16px) + 44px`,
        }}
      >
      {/* ─── Top: warm-gray, centered ─── */}
      <div className="bg-warm-gray flex flex-col items-center w-full px-4 py-8">
      {/* ⚡ Delivery banner */}
      <div className="text-center mb-6 font-bold text-2xl text-charcoal">
        ⚡ Lightning-fast delivery – your headshots arrive in under an hour.
      </div>        
      
      {/* Tabs */}
        <div className="mt-8 mb-8 w-full max-w-lg grid grid-cols-3 gap-6">
          <button
            onClick={() => setActiveTab("starter")}
            className={`whitespace-nowrap text-base sm:text-lg font-semibold px-1 py-2 rounded-md transition ${
              activeTab === "starter"
                ? "text-ivory translate-y-[-2px] border-b-4 border-charcoal"
                : "text-muted-foreground hover:text-charcoal"
            }`}
          >
            Starter Pack
          </button>
          <button
            onClick={() => setActiveTab("themed")}
            className={`whitespace-nowrap text-base sm:text-lg font-semibold px-1 py-2 rounded-md transition ${
              activeTab === "themed"
                ? "text-ivory translate-y-[-2px] border-b-4 border-charcoal"
                : "text-muted-foreground hover:text-charcoal"
            }`}
          >
            Themed Packs
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`whitespace-nowrap text-base sm:text-lg font-semibold px-1 py-2 rounded-md transition ${
              activeTab === "custom"
                ? "text-ivory translate-y-[-2px] border-b-4 border-charcoal"
                : "text-muted-foreground hover:text-charcoal"
            }`}
          >
            Custom Pack
          </button>
        </div>

{/* Starter Pack */}
{activeTab === "starter" && (
  <div className="bg-ivory w-full max-w-xl p-6 rounded-lg shadow-md mb-20">
    <h2 className="text-2xl text-charcoal font-bold mb-2 text-center">
      Starter Pack
    </h2>
    <p className="text-charcoal text-sm text-center mb-6">
      A curated mini-shoot designed to deliver polished, professional
      images — fast. Ideal for updating your LinkedIn, profile picture,
      or personal brand.
    </p>

    {/*
      Instead of hard-coding indexes, pick out the correct
      man/woman pack by its `forGender` field.
    */}
    {(() => {
      const womanPack = starterPacks.find((p) => p.forGender === "woman");
      const manPack   = starterPacks.find((p) => p.forGender === "man");
      if (!womanPack || !manPack) return null;

      return (
        <div className="grid grid-cols-2 gap-6">
          <Link
            href={`/overview/packs/${womanPack.id}/upsell?gender=woman`}
            className="w-full transition-transform duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="overflow-hidden rounded-lg">
              <img
                src={womanPack.exampleImg}
                alt={womanPack.name}
                className="block w-full"
              />
              <div className="bg-charcoal h-6 flex items-center justify-center">
                <span className="text-ivory text-sm">For Woman</span>
              </div>
            </div>
          </Link>
          <Link
            href={`/overview/packs/${manPack.id}/upsell?gender=man`}
            className="w-full transition-transform duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="overflow-hidden rounded-lg">
              <img
                src={manPack.exampleImg}
                alt={manPack.name}
                className="block w-full"
              />
              <div className="bg-charcoal h-6 flex items-center justify-center">
                <span className="text-ivory text-sm">For Man</span>
              </div>
            </div>
          </Link>
        </div>
      );
    })()}
  </div>
)}


        {/* Themed Packs — pick your gender first */}
        {activeTab === "themed" && (
          <div className="bg-ivory w-full max-w-xl p-6 rounded-lg shadow-md mb-20">
            <h2 className="text-2xl text-charcoal font-bold mb-2 text-center">
              Themed Packs
            </h2>
            <p className="text-charcoal text-sm text-center mb-6">
              First, choose whether you’re a woman or a man—then we’ll show you
              just your gender’s themes.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <Link
                href="/overview/packs/themed-selection?gender=woman"
                className="w-full transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="overflow-hidden rounded-lg bg-white">
                  <img
                      src={themedPacks[2]?.exampleImg || ""}
                      alt={themedPacks[2]?.name || ""}
                      className="block w-full"
                  />
                  <div className="bg-charcoal h-6 flex items-center justify-center">
                    <span className="text-ivory text-sm">For Woman</span>
                  </div>
                </div>
              </Link>
              <Link
                href="/overview/packs/themed-selection?gender=man"
                className="w-full transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="overflow-hidden rounded-lg bg-white">
                  <img
                  src={themedPacks[4]?.exampleImg || ""}
                  alt={themedPacks[4]?.name || ""}
                  className="block w-full"
                  />
                  <div className="bg-charcoal h-6 flex items-center justify-center">
                    <span className="text-ivory text-sm">For Man</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Custom Pack */}
        {activeTab === "custom" && (
           <div className="bg-ivory w-full max-w-xl p-6 rounded-lg shadow-md mb-20">
            <h2 className="text-2xl text-charcoal font-bold mb-2 text-center">
              Custom Pack
            </h2>
            <p className="text-charcoal text-sm text-center mb-8">
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
                  <div className="bg-charcoal h-6 flex items-center justify-center">
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
                  <div className="bg-charcoal h-6 flex items-center justify-center">
                    <span className="text-ivory text-sm">For Man</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom: charcoal full-width ─── */}
      <div className="bg-charcoal flex-1 w-full px-4 py-8 -mt-8 md:mt-0">
{/* === Preview Images === */}
<div className="max-w-6xl mx-auto mt-8">
  <h3 className="text-ivory font-semibold mb-8 text-center text-xl">
    Preview Images
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    {previewImages[activeTab].map((src, i) => (
      <div
        key={i}
        className="relative overflow-hidden rounded-2xl shadow-xl pb-[150%] bg-black"
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


        {/* === Models List === */}
        <div className="max-w-6xl mx-auto mt-8">
          <ClientSideModelsList serverModels={serverModels} />
        </div>
      </div>
    </div>
    </>
  );
}
