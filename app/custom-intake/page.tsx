// app/custom-intake/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import IntakeForm from "@/components/IntakeForm";

export default function CustomIntakePage() {
  const router = useRouter();
  const params = useSearchParams();
  const packId = params.get("packId") ?? "defaultPack";

  const handleComplete = () => {
    router.push(`/overview/packs/${packId}/next?extraPacks=custom`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Custom Photoshoot Intake Form
        </h1>
        <IntakeForm pack={packId} onComplete={handleComplete} />
      </div>
    </div>
  );
}

