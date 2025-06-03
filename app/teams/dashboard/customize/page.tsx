// File: app/teams/dashboard/customize/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

// ─── Example placeholders for “background” and “attire” options ───
// (Replace these arrays with your real images/values. Feel free to
// import them from a shared file if you already have them defined.)
const BACKGROUND_OPTIONS = [
  { label: "Studio", value: "studio", img: "/Womanstudio.png" },
  {
    label: "Cozy Indoor Space",
    value: "cozy indoor space",
    img: "/cozy indoor man.png",
  },
  { label: "Office", value: "office", img: "/man office.png" },
  {
    label: "Natural Outdoor",
    value: "natural outdoor",
    img: "/naturaloutdoor.png",
  },
];

const ATTIRE_OPTIONS = [
  {
    label: "Blazer or Suit Jacket",
    value: "blazer or suit jacket",
    img: "/blazer.png",
  },
  {
    label: "Casual Everyday Outfit",
    value: "casual everyday outfit",
    img: "/casualman.png",
  },
  { label: "Dress or Skirt", value: "dress or skirt", img: "/dressorskirt.png" },
];

export default function CustomizeHeadshotsPage() {
  const router = useRouter();
const SHOW_TEAMS = false; // 👈 Turn this to true later when ready

  // ───────────────────────────────────────────────────────────────
  // Local state: track which background / attire the user selects
  // ───────────────────────────────────────────────────────────────
  const [selectedBackground, setSelectedBackground] = useState<string | null>(
    null
  );
  const [selectedAttire, setSelectedAttire] = useState<string | null>(null);

  // ───────────────────────────────────────────────────────────────
  // Handler when the user clicks “Save & Continue”
  // (You can replace this with your own API call / navigation logic)
  // ───────────────────────────────────────────────────────────────
  const onSaveAndContinue = () => {
    // e.g. send something like:
    // { background: selectedBackground, attire: selectedAttire, teamId, ... }
    // For now, just go back to dashboard or to “create” page:
    router.push("/teams/dashboard/create");
  };

  // ───────────────────────────────────────────────────────────────
  // Disable the button until they’ve made both selections
  // ───────────────────────────────────────────────────────────────
  const isButtonDisabled = !selectedBackground || !selectedAttire;

  return (
    <div className="min-h-screen bg-muted/30 p-8 text-charcoal">
      {/* ─── Center everything and cap width at “max-w-4xl” on large screens ─── */}
      <div className="w-full max-w-4xl mx-auto">
        {/*
          ─── BACK BUTTON ──────────────────────────────────────────────
          Placed above the title; clicking it will navigate back one step.
        */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-ivory bg-muted-gold hover:underline"
          >
            &larr; Back
          </Button>
        </div>

        {/* ─── Page Title & Description ─── */}
        <h1 className="text-3xl font-bold mb-2">Customize Headshots</h1>
        <p className="mb-8">
          Select a background and attire style for your team’s headshots. Once you
          save, your choices will apply to every team member’s generated image
          set.
        </p>

        {/* ─── White “Card” for Background Picker ─── */}
        <Card className="mb-8 p-6 bg-white text-black">
          <h2 className="text-xl font-semibold mb-4 text-muted-gold">
            Choose a Background
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {BACKGROUND_OPTIONS.map((opt) => {
              const isSelected = selectedBackground === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedBackground(opt.value)}
                  className={`
                    relative rounded-lg overflow-hidden transition-shadow
                    ${isSelected
                      ? "border-4 border-muted-gold shadow-lg"
                      : "border-2 border-gray-200 hover:shadow-md"
                    }
                  `}
                  style={{ paddingBottom: "2rem" }}
                >
                  {/* Changed from aspect-[3/2] → aspect-[2/3] to avoid cropping */}
                  <div className="w-full aspect-[2/3] bg-gray-100">
                    {opt.img && (
                      <Image
                        src={opt.img}
                        alt={opt.label}
                        fill
                        className="object-cover object-center"
                      />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-muted-gold h-10 flex items-center justify-center px-2">
                    <span className="text-white text-sm font-medium text-center">
                      {opt.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ─── White “Card” for Attire Picker ─── */}
        <Card className="mb-8 p-6 bg-white text-black">
          <h2 className="text-xl font-semibold mb-4 text-muted-gold">
            Choose an Attire Style
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {ATTIRE_OPTIONS.map((opt) => {
              const isSelected = selectedAttire === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedAttire(opt.value)}
                  className={`
                    relative rounded-lg overflow-hidden transition-shadow
                    ${isSelected
                      ? "border-4 border-muted-gold shadow-lg"
                      : "border-2 border-gray-200 hover:shadow-md"
                    }
                  `}
                  style={{ paddingBottom: "2rem" }}
                >
                  {/* Changed from aspect-[3/2] → aspect-[2/3] to avoid cropping */}
                  <div className="w-full aspect-[2/3] bg-gray-100">
                    {opt.img && (
                      <Image
                        src={opt.img}
                        alt={opt.label}
                        fill
                        className="object-cover object-center"
                      />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-muted-gold h-10 flex items-center justify-center px-2">
                    <span className="text-white text-sm font-medium text-center">
                      {opt.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ─── Save & Continue Button ─── */}
        <div className="max-w-md mx-auto">
          <Button
            onClick={onSaveAndContinue}
            disabled={isButtonDisabled}
            className={`
              w-full py-3 rounded-md font-semibold
              ${isButtonDisabled
                ? "bg-gray-300 text-charcoal cursor-not-allowed"
                : "bg-muted-gold text-white hover:bg-sage-green"
              }
            `}
          >
            Save &amp; Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
