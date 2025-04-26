// components/TrainModelFlow.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
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
import StripeCheckoutButton from "@/components/StripeCheckoutButton";
const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";
const PRICE_IDS: Record<string,string> = {
    starter: "price_1RHmnVCs03tLUXoK4iTvnduW",
    standard: "price_1RHmnnCs03tLUXoKLXWGbUqt",
    pro:      "price_1RHmo9Cs03tLUXoKiIai8D2O",
    studio:   "price_1RHmoNCs03tLUXoKRpzgeqUu",
  };
export default function TrainModelFlow({
  packSlug,
}: {
  packSlug: string;
}) {
  // false = show form, true = show upload
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Back button */}
      <Link
        href={packsIsEnabled ? "/overview/packs" : "/overview"}
        className="inline-block mb-4"
      >
        <Button variant="outline">
          <FaArrowLeft className="mr-2" />
          Go Back
        </Button>
      </Link>

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
    /* step 1: questionnaire */
    <IntakeForm
      pack={packSlug}
      onComplete={() => setShowUpload(true)}
    />
  ) : (
    /* step 2: uploads + checkout */
    <div className="flex flex-col gap-6">
      {/* your existing upload zone */}
      <TrainModelZone packSlug={packSlug} />

      {/* stripe checkout button */}
      <div className="mt-4 text-center">
        <StripeCheckoutButton priceId={PRICE_IDS[packSlug]} />
      </div>
    </div>
  )}
</CardContent>
      </Card>
    </div>
  );
}
