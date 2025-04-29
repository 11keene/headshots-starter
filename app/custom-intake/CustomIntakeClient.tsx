// app/custom-intake/CustomIntakeClient.tsx
"use client";

import { useRouter } from "next/navigation";
import IntakeForm from "@/components/IntakeForm";

export default function CustomIntakeClient({ packId }: { packId: string }) {
  const router = useRouter();

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
