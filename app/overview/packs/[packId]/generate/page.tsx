"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function GeneratePage() {
  const { packId } = useParams();
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"idle"|"training"|"error"|"done">("idle");

  // read once
  const extraPacks = params.get("extraPacks") || "";
  const uploaded = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem(`uploads-${packId}`) || "[]")
    : [];

  useEffect(() => {
    if (status !== "idle") return;
    setStatus("training");

    (async () => {
      try {
        const res = await fetch("/stria/train-model", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: uploaded,
            type: "headshot",
            pack: packId,
            name: `Headshot Pack ${packId}`,
            characteristics: extraPacks.split(","),
          }),
        });

        const json = await res.json();
        if (json.message === "success") {
          setStatus("done");
        } else {
          console.error("Training error:", json);
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    })();
  }, [packId, extraPacks, uploaded, status]);

  if (status === "training") {
    return (
      <div className="p-8 text-center">
        <Spinner />
        <p className="mt-4">Your AI model is being trained…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Oops—something went wrong.</p>
        <Button onClick={() => router.push(`/overview/packs/${packId}/next`)}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">All set!</h1>
      <p className="mb-6">
        Your images are being generated. Check your dashboard shortly.
      </p>
      <Button onClick={() => router.push(`/overview/packs/${packId}/next`)}>
        Go to Uploads
      </Button>
    </div>
  );
}
