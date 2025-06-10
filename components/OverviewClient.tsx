// File: components/OverviewClient.tsxs
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";
import { DashboardDropdownToggle } from "@/components/DashboardDropdownToggle";
import type { Pack } from "@/data/packs";

type Tab = "headshots" | "multi-purpose" | "teams";

const previewImages: Record<Tab, string[]> = {
  headshots: [
    "/adam1.png",
    "https://sdbooth2-production.s3.amazonaws.com/72tpgztgtucn8g1leq8h4h8ezdsn",
    "https://sdbooth2-production.s3.amazonaws.com/b6izing8haworbs85wtd2ys2g59p",
    "/eryn.png",
    "https://sdbooth2-production.s3.amazonaws.com/5blgk0c7e4li3r57zv9fvq1ipwgs",
  ],
  "multi-purpose": [
    "https://sdbooth2-production.s3.amazonaws.com/akgabemjdyhbp097wa2j6gke66zw",
    "/chan.png",
    "https://sdbooth2-production.s3.amazonaws.com/qabd979c6hr61yqdfm6h321wyyqb",
    "https://sdbooth2-production.s3.amazonaws.com/14faz1iwfc4am8e96023gzyn66uj",
  ],
  teams: [
    "https://sdbooth2-production.s3.amazonaws.com/sm41olkjbp6eqqi2r3j5gn4mc0ze",
    "https://sdbooth2-production.s3.amazonaws.com/14faz1iwfc4am8e96023gzyn66uj",
    "https://sdbooth2-production.s3.amazonaws.com/ybqcdvkkbwop2eccyn50x4c7vx1w",
  ],
};

interface OverviewClientProps {
  serverModels: any[];
  serverCredits: number;
  availablePacks: Pack[];
  userId: string;
}

export default function OverviewClient({
  serverModels,
  serverCredits,
  availablePacks,
  userId,
}: OverviewClientProps) {
  const searchParams = useSearchParams();
const rawTab = searchParams.get("tab") as Tab;
const tabParam = rawTab === "multi-purpose" ? "headshots" : rawTab || "headshots";
  const [activeTab, setActiveTab] = useState<Tab>(tabParam);
  const router = useRouter();
  const supabase = createClientComponentClient(); // no <Database> generic, so .from("packs") is allowed

  const SHOW_TEAMS = false; // Toggle if you ever want to enable the “teams” tab

  useEffect(() => {
    localStorage.setItem("lastDashboard", "personal");
  }, []);

  // Set up the image carousel
  const slides = previewImages[activeTab];
  const cycleDuration = slides.length * 8;

  const headerText = {
    headshots:
      "A new image. A clearer vision. All within the hour.",
    "multi-purpose":
      "🎩 You wear more than one hat, your headshot should too.",
    teams:
      "👥 Bring your whole team into focus – group portraits made easy.",
  }[activeTab];

  // When user clicks “Buy {pack.name}”
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (packSlug: string) => {
    setError(null);
    setLoadingPack(packSlug);

    // 1) Generate a brand-new UUID 
    const newPackId = uuidv4(); 
    // e.g. "11111111-2222-3333-4444-555555555555"

    // 2) Insert into your Supabase "packs" table
    const { error: dbError } = await supabase
      .from("packs")
      // @ts-ignore: allow naked "packs" table
      .insert({
        id: newPackId,
        user_id: userId,
        pack_type: packSlug,
        status: "pending",
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Error creating pack:", dbError.message);
      setError("Failed to create pack. Please try again.");
      setLoadingPack(null);
      return;
    }

    // 3) Redirect to the Upload step at `/overview/packs/{UUID}/next?gender=man`
    // We can append `?gender=man` or `?gender=woman` if your Upload page expects it.
    router.push(`/overview/packs/${newPackId}/next?gender=${packSlug.endsWith("-man") ? "man" : "woman"}`);
  };

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

      {/* ─── Dropdown Toggle ─── */}
      <DashboardDropdownToggle />

      {/* ─── Tabs + Banner ─── */}
      <div className="px-4 mt-4">
<div className="flex space-x-6 md:justify-center">
  {(["headshots", ...(SHOW_TEAMS ? ["teams"] : [])] as Tab[]).map(
    (tab) => (
      <button
        key={tab}
        onClick={() => {
          setActiveTab(tab);
          router.replace(`/overview?tab=${encodeURIComponent(tab)}`, {
            scroll: false,
          });
        }}
        className={`pb-2 font-semibold text-sm transition ${
          activeTab === tab
            ? "text-muted-gold border-b-2 border-muted-gold"
            : "text-charcoal hover:text-muted-gold"
        }`}
      >
        {tab === "headshots"
          ? "Professional Headshots"
          : tab === "multi-purpose"
          ? "Multi-Purpose"
          : "Teams"}
      </button>
    )
  )}
</div>
        <div className="mt-4 font-bold text-center text-2xl text-charcoal">
          {headerText}
        </div>
      </div>

      {/* ─── Continuous Sliding Carousel ─── */}
      <div className="relative w-full max-w-xl mx-auto mt-8 overflow-hidden rounded-xl">
        <motion.div
          className="flex"
          animate={{ x: [`0%`, `-${100 * slides.length}%`] }}
          transition={{
            duration: cycleDuration,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {[...slides, ...slides].map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full px-2">
              <img
                src={src}
                alt={`${activeTab} preview ${(i % slides.length) + 1}`}
                className="w-full h-auto object-cover rounded-xl shadow-lg"
              />
            </div>
          ))}
        </motion.div>

        {/* Left/Right Fade Overlays */}
        <div className="pointer-events-none absolute inset-0 flex justify-between">
          <div className="w-16 h-full bg-gradient-to-r from-ivory to-transparent" />
          <div className="w-16 h-full bg-gradient-to-l from-ivory to-transparent" />
        </div>
      </div>

     
      {/* ─── Models List ─── */}
      <div className="flex-1 bg-ivory px-4 py-8 mt-12">
        <div className="max-w-6xl mx-auto">
          <ClientSideModelsList serverModels={serverModels} />
        </div>
      </div>
    </div>
  );
}
