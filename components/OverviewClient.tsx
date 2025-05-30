// File: components/OverviewClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";

type Tab = "headshots" | "multi-purpose" | "teams";

const previewImages: Record<Tab, string[]> = {
  headshots: [
    "https://sdbooth2-production.s3.amazonaws.com/oy0hf5ubsj407dvozb7jbkjd2rp2",
    "https://sdbooth2-production.s3.amazonaws.com/b6izing8haworbs85wtd2ys2g59p",
    "https://sdbooth2-production.s3.amazonaws.com/25ijtdxkeycqvgwkbvm7qjkmo57a",
    "https://sdbooth2-production.s3.amazonaws.com/ff9azl6wxsse2e8y3wresjp9gkqj",
  ],
  "multi-purpose": [
    // replace with your multi-purpose previews
      "https://sdbooth2-production.s3.amazonaws.com/i219zbezb0wpcf7w7zskf0xxitib",
    "https://sdbooth2-production.s3.amazonaws.com/14faz1iwfc4am8e96023gzyn66uj",
    "https://sdbooth2-production.s3.amazonaws.com/ybqcdvkkbwop2eccyn50x4c7vx1w",
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

  // the slides for the active tab
  const slides = previewImages[activeTab];

  // header text per tab
  const headerText = {
    headshots: "⚡ Lightning-fast delivery – your headshots arrive in under an hour.",
    "multi-purpose": "🎩 You wear more than one hat, your HeadShot should too.",
    teams: "👥 Bring your whole team into focus – group portraits made easy.",
  }[activeTab];

  //
  // ─── build the keyframes and timing for a seamless loop ────────────────
  //
  // e.g. ["0%", "-100%", "-200%", ..., "0%"]
  const xKeyframes = slides
    .map((_, i) => `-${i * 100}%`)
    .concat("0%");
  // times: [0, 1/n, 2/n, ..., 1]
  const times = slides
    .map((_, i) => i / slides.length)
    .concat(1);
  const cycleDuration = slides.length * 4; // 4 seconds per image

  //
  // ─── RENDER ────────────────────────────────────────────────────────────
  //
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
          {(["headshots", "multi-purpose", "teams"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-semibold text-sm transition ${
                activeTab === tab
                  ? "text-muted-gold border-b-2 border-muted-gold"
                  : "text-charcoal hover:text-muted-gold"
              }`}
            >
              {tab === "headshots"
                ? "Headshots"
                : tab === "multi-purpose"
                ? "Multi-Purpose"
                : "Teams"}
            </button>
          ))}
        </div>
        <div className="mt-4 font-bold text-center text-2xl text-charcoal">
          {headerText}
        </div>
      </div>

      {/* ─── Continuous Sliding Carousel ─── */}
      <div className="relative w-full max-w-xl mx-auto mt-8 overflow-hidden rounded-xl">
        {/* the moving strip */}
        <motion.div
          className="flex"
          animate={{ x: xKeyframes }}
          transition={{
            duration: cycleDuration,
            ease: "linear",
            times,
            repeat: Infinity,
          }}
        >
          {/* each slide takes 100% of wrapper */}
          {slides.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full px-2" /* px-2 gives space between */
            >
              <img
                src={src}
                alt={`${activeTab} preview ${i + 1}`}
                className="w-full h-auto object-cover rounded-xl shadow-lg"
              />
            </div>
          ))}
          {/* duplicate the first slide for seamless wrap */}
          <div className="flex-shrink-0 w-full px-2">
            <img
              src={slides[0]}
              alt={`${activeTab} preview duplicate`}
              className="w-full h-auto object-cover rounded-xl shadow-lg"
            />
          </div>
        </motion.div>

        {/* left/right fade overlays */}
        <div className="pointer-events-none absolute inset-0 flex justify-between">
          <div className="w-16 h-full bg-gradient-to-r from-ivory to-transparent" />
          <div className="w-16 h-full bg-gradient-to-l from-ivory to-transparent" />
        </div>
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
