"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiUploadCloud, FiArrowLeft } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const { packId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Rehydrate previews from sessionStorage
  const [previews, setPreviews] = useState<string[]>([]);
  const [filesRequired] = useState(6);

  // on mount: load any saved previews
  useEffect(() => {
    const saved = sessionStorage.getItem("astriaPreviews");
    if (saved) setPreviews(JSON.parse(saved));
  }, []);

  // if Stripe returned us here with a session_id, auto‐trigger Astria
  useEffect(() => {
    if (searchParams.get("session_id")) {
      // call your train endpoint
      fetch("/api/stria/train-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: previews,
          type: packId,
          pack: packId,
          name: `${packId}-model`,
          characteristics: {}
        }),
      }).then(() => {
        // optionally navigate to a "generating..." status page
        router.push(`/overview/packs/${packId}/status`);
      });
    }
  }, [previews, searchParams, packId, router]);

  // handle file selection ➞ generate previews + persist
  const onFiles = useCallback((fList: FileList | null) => {
    if (!fList) return;
    Array.from(fList).slice(0, 10).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPreviews((p) => {
          const next = [...p, url].slice(0, 10);
          sessionStorage.setItem("astriaPreviews", JSON.stringify(next));
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  const canContinue = previews.length >= filesRequired;
  const goToPricing = () => router.push(`/pricing?packId=${packId}`);

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center mb-6 text-gray-700 hover:text-black"
      >
        <FiArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Upload your photos</h1>
      <p className="text-gray-600 mb-6">
        Select at least <span className="font-semibold">{filesRequired}</span> photos (max 10).
      </p>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition cursor-pointer"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => onFiles(e.target.files)}
        />
        <FiUploadCloud className="mx-auto mb-4 text-4xl text-red-600" />
        <Button variant="outline">Browse files</Button>
        <p className="mt-2 text-sm text-gray-500">
          or drag & drop your photos here (PNG, JPG, WEBP up to 120 MB)
        </p>
      </div>

      {previews.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`preview ${i}`}
              className="w-full h-24 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end">
        <span className="self-center mr-auto text-sm text-gray-600">
          {previews.length} of {filesRequired} required
        </span>
        <Button
          disabled={!canContinue}
          onClick={goToPricing}
          className="bg-red-600 text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
