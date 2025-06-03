// File: app/status/[packId]/page.tsx
"use client"; // ← Must be the very first line

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StatusPageProps {
  params: { packId: string };
}

type GenerationStatus = "idle" | "generatingPrompts" | "trainingAstria" | "done" | "error";

export default function StatusPage({ params }: StatusPageProps) {
  const { packId } = params;
  const router = useRouter();

  // ─────────────────────────────────────────────────────────────────────────────
  // Local React state
  // ─────────────────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [astriaImages, setAstriaImages] = useState<string[]>([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 1: When this page first loads, kick off the “generate prompts” API call
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function runGenerationFlow() {
      try {
        setStatus("generatingPrompts");

        // 1A) Call /api/generate-prompts to get the array of GPT prompts
        console.log(`[StatusPage] Calling /api/generate-prompts for packId=${packId}`);
        const gpRes = await fetch("/api/generate-prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packId }),
        });

        if (!gpRes.ok) {
          const errJson = await gpRes.json();
          console.error("[StatusPage] generate-prompts returned error:", errJson);
          setErrorMessage(errJson.error || `Error ${gpRes.status}`);
          setStatus("error");
          return;
        }

        const gpData = await gpRes.json();
        const prompts: string[] = gpData.prompts;
        console.log("[StatusPage] Received prompts:", prompts);

        // 1B) After we have the array of prompts, send them to Astria
        setStatus("trainingAstria");

        console.log(
          "[StatusPage] Calling /api/create-astria-job with prompts, packId=",
          packId
        );
        const astriaRes = await fetch("/api/create-astria-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packId, prompts }),
        });

        if (!astriaRes.ok) {
          const errJson = await astriaRes.json();
          console.error("[StatusPage] create-astria-job returned error:", errJson);
          setErrorMessage(errJson.error || `Error ${astriaRes.status}`);
          setStatus("error");
          return;
        }

        const astriaData = await astriaRes.json();
        const images: string[] = astriaData.images;
        console.log("[StatusPage] Received Astria images:", images);

        // 1C) Save the returned image URLs into state so we can render them
        setAstriaImages(images);
        setStatus("done");
      } catch (e: any) {
        console.error("[StatusPage] Unexpected error in runGenerationFlow:", e);
        setErrorMessage(e.message || "Something went wrong.");
        setStatus("error");
      }
    }

    runGenerationFlow();
  }, [packId]);

  // ─────────────────────────────────────────────────────────────────────────────
  // UI: Show different messages based on `status`
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      {status === "idle" && <p>Waiting…</p>}
      
      {status === "generatingPrompts" && (
        <p className="text-xl font-medium">🔄 Generating image prompts…</p>
      )}
      
      {status === "trainingAstria" && (
        <p className="text-xl font-medium">⏳ Training your custom model (Astria)…</p>
      )}
      
      {status === "done" && (
        <>
          <h2 className="text-2xl font-bold mb-4">🎉 Your images are ready!</h2>
          <div className="grid grid-cols-1 gap-4">
            {astriaImages.map((url, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <img
                  src={url}
                  alt={`Generated #${idx + 1}`}
                  className="w-64 h-64 object-cover rounded-lg mb-2"
                />
                <a
                  href={url}
                  download={`pack_${packId}_image_${idx + 1}.png`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Download Image #{idx + 1}
                </a>
              </div>
            ))}
          </div>
        </>
      )}
      
      {status === "error" && (
        <p className="text-red-600">Error: {errorMessage}</p>
      )}
    </div>
  );
}
