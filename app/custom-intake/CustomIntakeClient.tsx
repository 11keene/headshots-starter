"use client";

import { useRouter, useSearchParams } from "next/navigation";
import IntakeForm from "@/components/IntakeForm";

export default function CustomIntakeClient({ packId }: { packId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const from = params?.get("from") ?? ""; // "headshot" or "custom", defaults to empt
  const handleComplete = () => {
    if (from === "headshot") {
      // user came from headshot upsell → go straight to upload
      router.push(`/overview/packs/${packId}/next`);
    } else {
      // user started from custom → return to upsell headshot tab
      router.push(
        `/overview/packs/${packId}/upsell?tab=headshot`
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl text-charcoal font-bold text-center mb-8">
          Custom Photoshoot Intake Form
        </h1>
        <IntakeForm pack={packId} onComplete={handleComplete} />
      </div>
    </div>
  );
}
