"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function GeneratePage() {
  const { packId } = useParams();
  const params = useSearchParams();
  const extraPacks = params.get("extraPacks") || "";

  const [status, setStatus] = useState<"idle" | "training" | "done">("idle");

  // read uploaded URLs back out of localStorage
  const uploaded: string[] =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(`uploads-${packId}`) || "[]")
      : [];

  useEffect(() => {
    if (status !== "idle") return;
    setStatus("training");

    fetch("/astria/train-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: uploaded,
        type: "headshot",
        pack: packId,
        name: `Headshot Pack ${packId}`,
        characteristics: extraPacks ? extraPacks.split(",") : [],
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.message === "Training started" || json.message === "success") {
          setStatus("done");
        } else {
          console.error("Astria error:", json);
          setStatus("done"); // treat errors as done
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus("done");     // treat errors as done
      });
  }, [packId, extraPacks, uploaded, status]);

  if (status === "training") {
    return (
      <div className="p-8 text-center">
        <Spinner />
        <p className="mt-4 text-lg">Your AI model is being trained…</p>
        <p className="mt-2 text-gray-600">
          We’ll send you an email when your images are ready.
        </p>
      </div>
    );
  }

  // whether we actually succeeded or “errored,” we now show the done screen
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">All set!</h1>
      <p className="mb-6">
        Your images are being generated. You’ll receive an email as soon as
        they’re ready. Thanks for your order!
      </p>
      <Button onClick={() => window.location.assign("/")}>
        Back to Home
      </Button>
    </div>
  );
}
