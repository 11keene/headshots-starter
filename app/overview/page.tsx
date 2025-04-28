"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // If you want buttons somewhere else too

export default function OverviewPage() {
  const headshotRef = useRef<HTMLDivElement>(null);
  const customRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Tabs */}
      <div className="flex gap-6 mt-8">
        <button
          onClick={() => scrollToSection(headshotRef)}
          className="text-black font-semibold text-lg hover:underline"
        >
          Choose a Headshot
        </button>
        <button
          onClick={() => scrollToSection(customRef)}
          className="text-black font-semibold text-lg hover:underline"
        >
          Custom Photoshoot
        </button>
      </div>

      {/* Choose a Headshot Section */}
      <div ref={headshotRef} className="mt-16 flex flex-col items-center w-full px-4">
        <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Headshot</h2>
        <p className="text-muted-foreground mb-8 text-center">
          Choose the type of headshot you would like to create.
        </p>

        {/* Clickable image leading to /overview/packs */}
        <Link href="/overview/packs" className="w-full max-w-md">
  <img
    src="/your-pack-example.jpg"
    alt="Choose a Headshot"
    className="rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full"
  />
</Link>
      </div>

      {/* Custom Photoshoot Section */}
      <div ref={customRef} className="mt-24 flex flex-col items-center w-full px-4">
        <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Custom Style</h2>
        <p className="text-muted-foreground mb-8 text-center">
          Generate more complex and customizable images.
        </p>

        {/* Clickable image leading to Train Model flow */}
        <Link href="/train" className="w-full max-w-md">
  <img
    src="/your-custom-example.jpg"
    alt="Custom Photoshoot"
    className="rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full"
  />
</Link>
      </div>
    </div>
  );
}