// app/overview/packs/[packId]/next/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiUploadCloud, FiArrowLeft } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const { packId } = useParams();            // ← grab packId first
  const router = useRouter();
  const params = useSearchParams();
  const extraPacks = params.get("extraPacks") || "";

  const [files, setFiles] = useState<File[]>([]);

  // Whenever `files` changes, write their preview URLs into localStorage
  useEffect(() => {
    if (files.length > 0 && packId) {
      const previewUrls = files.map((f) => URL.createObjectURL(f));
      localStorage.setItem(
        `uploads-${packId}`,
        JSON.stringify(previewUrls)
      );
    }
  }, [files, packId]);

  // handle file selection
  const onFiles = useCallback((fList: FileList | null) => {
    if (!fList) return;
    const arr = Array.from(fList);
    setFiles((prev) => [...prev, ...arr].slice(0, 10));
  }, []);

  // drag & drop
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  // when ready, go to pricing (you’ve already persisted the URLs)
  const goPricing = () => {
    router.push(`/pricing?packId=${packId}&extraPacks=${extraPacks}`);
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center mb-6 text-gray-700 hover:text-black"
      >
        <FiArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Upload your photos</h1>
      <p className="text-gray-600 mb-6">
        Select at least <span className="font-semibold">6</span> photos (max 10).
        Mix close-ups, selfies &amp; mid-range shots to help the AI learn you best.
      </p>

      {/* Drag & Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition cursor-pointer"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          title="Upload your photos"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => onFiles(e.target.files)}
        />
        <FiUploadCloud className="mx-auto mb-4 text-4xl text-red-600" />
        <Button variant="outline" onClick={() => {/* hidden input covers this */}}>
          Browse files
        </Button>
        <p className="mt-2 text-sm text-gray-500">
          or drag &amp; drop your photos here (PNG, JPG, WEBP up to 120 MB)
        </p>
      </div>

      {/* Preview Strip */}
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          {files.map((f, i) => (
            <img
              key={i}
              src={URL.createObjectURL(f)}
              alt={f.name}
              className="w-full h-24 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Guidance Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Selfies", desc: "Frontal, well-lit at eye-level", img: "/placeholders/selfie.png" },
          { title: "Variety", desc: "Different outfits &amp; backgrounds", img: "/placeholders/variety.png" },
          { title: "No Blurry", desc: "Sharp, not too dark or bright", img: "/placeholders/no-blurry.png" },
          { title: "Natural", desc: "Avoid heavy filters or edits", img: "/placeholders/natural.png" },
        ].map((card) => (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <img
              src={card.img}
              alt={card.title}
              className="w-16 h-16 rounded-md object-cover"
            />
            <div>
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sticky Continue Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end">
        <span className="self-center mr-auto text-sm text-gray-600">
          {files.length} of 6 required
        </span>
        <Button disabled={files.length < 6} onClick={goPricing}>
          Continue
        </Button>
      </div>
    </div>
  );
}
