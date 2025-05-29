// components/CustomIntakeClient.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import IntakeForm from "@/components/IntakeForm";

export default function CustomIntakeClient({ packId }: { packId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  // carry forward gender so upload page can read it if needed
  const gender = params?.get("gender") ?? "unknown";

  const handleComplete = () => {
    // send straight to the upload page
router.push(
  `/overview/packs/${packId}/next?gender=${gender}`
);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <IntakeForm pack={packId} onComplete={handleComplete} />
      </div>
    </div>
  );
}
