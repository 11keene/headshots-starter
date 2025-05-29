// File: components/OverviewClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";

type Tab = "headshots" | "teams";

const previewImages: Record<Tab, string[]> = {
  headshots: [
    "https://sdbooth2-production.s3.amazonaws.com/oy0hf5ubsj407dvozb7jbkjd2rp2",
    "https://sdbooth2-production.s3.amazonaws.com/b6izing8haworbs85wtd2ys2g59p",
    "https://sdbooth2-production.s3.amazonaws.com/25ijtdxkeycqvgwkbvm7qjkmo57a",
    "https://sdbooth2-production.s3.amazonaws.com/ff9azl6wxsse2e8y3wresjp9gkqj",
  ],
  teams: [
    "https://sdbooth2-production.s3.amazonaws.com/i219zbezb0wpcf7w7zskf0xxitib",
    "https://sdbooth2-production.s3.amazonaws.com/14faz1iwfc4am8e96023gzyn66uj",
    "https://sdbooth2-production.s3.amazonaws.com/ybqcdvkkbwop2eccyn50x4c7vx1w",
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
  const tabParam = (searchParams.get("tab") as Tab) || "headshots";
  const [activeTab, setActiveTab] = useState<Tab>(tabParam);

  // slideshow index
  const slides = previewImages[activeTab];
  const [slideIndex, setSlideIndex] = useState(0);

  // auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // reset index when tab changes
  useEffect(() => {
    setSlideIndex(0);
  }, [activeTab]);

  const prev = () =>
    setSlideIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setSlideIndex((i) => (i + 1) % slides.length);

  return (
    <div
      className="min-h-screen flex flex-col w-full pb-16"
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom), 16px) + 44px`,
      }}
    >
      {/* ─── Back Button ─── */}
      <div className="px-4 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-muted-gold text-ivory px-3 py-1 rounded-full"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </Link>
      </div>

      {/* ─── Tabs + Banner ─── */}
      <div className="px-4 mt-4">
        <div className="flex space-x-6 md:justify-center">
          {(["headshots", "teams"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-semibold text-sm transition ${
                activeTab === tab
                  ? "text-muted-gold border-b-2 border-muted-gold"
                  : "text-charcoal hover:text-muted-gold"
              }`}
            >
              {tab === "headshots" ? "Headshots" : "Teams"}
            </button>
          ))}
        </div>
        <div className="mt-4 font-bold text-center text-2xl text-charcoal">
          ⚡ Lightning-fast delivery – your headshots arrive in under an hour.
        </div>
      </div>

      {/* ─── Slideshow ─── */}
      <div className="relative w-full max-w-xl mx-auto mt-8">
        <img
          src={slides[slideIndex]}
          alt={`${activeTab} preview ${slideIndex + 1}`}
          className="w-full h-auto object-cover rounded-xl shadow-lg"
        />
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-ivory p-2 rounded-full shadow hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-5 h-5 text-charcoal" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-ivory p-2 rounded-full shadow hover:bg-white transition"
        >
          <ArrowRightIcon className="w-5 h-5 text-charcoal" />
        </button>
      </div>

      {/* ─── Models List ─── */}
      <div className="flex-1 bg-ivory px-4 py-8 mt-8">
        <div className="max-w-6xl mx-auto">
          <ClientSideModelsList serverModels={serverModels} />
        </div>
      </div>
    </div>
  );
}
