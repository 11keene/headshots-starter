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

const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

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
        <CardContent>
          {!showUpload ? (
            // Step 1: Intake form
            <IntakeForm
              pack={packSlug}
              onComplete={() => setShowUpload(true)}
            />
          ) : (
            // Step 2: Your existing upload component
            <TrainModelZone packSlug={packSlug} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
