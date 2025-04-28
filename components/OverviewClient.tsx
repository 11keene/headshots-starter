"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";

export default function OverviewClient({ serverModels }: { serverModels: any[] }) {
  const headshotRef = useRef<HTMLDivElement>(null);
  const customRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"headshot" | "custom">("headshot");

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, tab: "headshot" | "custom") => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col items-center w-full px-4">
      {/* Tabs */}
      <div className="flex gap-6 mt-8 mb-8">
        <button
          onClick={() => scrollToSection(headshotRef, "headshot")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition 
            ${activeTab === "headshot" ? "text-black translate-y-[-2px] border-b-4 border-red-500" : "text-muted-foreground hover:text-black"}`}
        >
          Choose a Headshot
        </button>

        <button
          onClick={() => scrollToSection(customRef, "custom")}
          className={`text-base sm:text-lg font-semibold px-4 py-2 rounded-md transition 
            ${activeTab === "custom" ? "text-black translate-y-[-2px] border-b-4 border-red-500" : "text-muted-foreground hover:text-black"}`}
        >
          Custom Photoshoot
        </button>
      </div>

      {/* Choose a Headshot */}
      <div ref={headshotRef} className="flex flex-col items-center w-full max-w-md mb-20">
        <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Headshot</h2>
        <p className="text-muted-foreground mb-8 text-center">
          Choose the type of headshot you would like to create.
        </p>
        <Link href="/overview/packs" className="w-full">
          <img
            src="/your-pack-example.jpg"
            alt="Choose a Headshot"
            className="rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full"
          />
        </Link>
      </div>

      {/* Custom Photoshoot */}
      <div ref={customRef} className="flex flex-col items-center w-full max-w-md mb-20">
        <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Custom Style</h2>
        <p className="text-muted-foreground mb-8 text-center">
          Generate more complex and customizable images.
        </p>
        <Link href="/train" className="w-full">
          <img
            src="/your-custom-example.jpg"
            alt="Custom Photoshoot"
            className="rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl w-full"
          />
        </Link>
      </div>

      {/* Models List */}
      <div className="w-full max-w-6xl">
        <ClientSideModelsList serverModels={serverModels} />
      </div>
    </div>
  );
}
