// components/CustomIntakeClient.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import IntakeForm from "@/components/IntakeForm";

export default function CustomIntakeClient({ packId }: { packId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  // read the gender query param—if it's “woman” use that, otherwise “man”
  const gender = params.get("gender") === "woman" ? "woman" : "man";

  const handleComplete = () => {
    // when the form is done, route to your upload step
    router.push(`/overview/packs/${packId}/next?gender=${gender}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <IntakeForm pack={packId} onComplete={handleComplete} />
      </div>
    </div>
  );
}
