"use client";

import { useEffect, useState } from "react";

export default function GenerateImageClient({ packId }: { packId: string }) {
  const [status, setStatus] = useState<"loading" | "generating" | "done" | "error">("loading");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!packId) return;

    const runGeneration = async () => {
      setStatus("generating");

      try {
        const res = await fetch("/api/generate-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packId }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to generate image");
        }

        setImageUrl(result.images?.[0] || null);
        setStatus("done");
      } catch (err: any) {
        setError(err.message || "Unexpected error");
        setStatus("error");
      }
    };

    runGeneration();
  }, [packId]);

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (status === "generating") {
    return (
      <div className="text-center mt-12">
        <h1 className="text-2xl font-bold mb-2">Generating your image...</h1>
        <p className="text-gray-500">This usually takes less than a minute.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center mt-12 text-red-600">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (status === "done" && imageUrl) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Your image is ready! 🎉</h1>
        <img
          src={imageUrl}
          alt="Generated"
          className="w-full max-w-md mx-auto rounded-lg shadow-lg"
        />
      </div>
    );
  }

  return null;
}
