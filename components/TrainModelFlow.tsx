// components/TrainModelFlow.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FaArrowLeft } from "react-icons/fa";
import TrainModelZone from "@/components/TrainModelZone";
import IntakeForm from "@/components/IntakeForm";
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";
const PRICE_IDS: Record<string,string> = {
    starter: "price_1RJLBd4RnIZz7j08beYwRGv1",
    standard: "price_1RJLCO4RnIZz7j08tJ3vN1or",
    pro:      "price_1RJLDE4RnIZz7j08RlQUve2s",
    studio:   "price_1RJLDf4RnIZz7j08TLcrNcQ6",
  };
export default function TrainModelFlow({
  packSlug,
}: {
  packSlug: string;
}) {
  // false = show form, true = show upload
  const [showUpload, setShowUpload] = useState(false);
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Back button */}
      <div className="inline-block mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          <FaArrowLeft className="mr-2" />
          Go Back
        </Button>
      </div>

      {/* Card wrapper */}
      <Card>
        <CardHeader>
          <CardTitle>Train Model</CardTitle>
          <CardDescription>
            {showUpload
              ? "Now, upload your photos to train your model."
              : "First, tell us how you want your headshots to look."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
  {!showUpload ? (
    <IntakeForm pack={packSlug} onComplete={() => setShowUpload(true)} />
  ) : (
    <TrainModelZone packSlug={packSlug} />
  )}
</CardContent>
      </Card>
    </div>
  );
}
