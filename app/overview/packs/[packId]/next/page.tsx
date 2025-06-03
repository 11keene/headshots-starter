"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUploadCloud, FiArrowLeft, FiTrash2, FiLoader } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useUploadContext } from "@/components/UploadContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";

const supabase = createClientComponentClient();

const PRICE_IDS_CLIENT: Record<"headshots" | "multi-purpose", string> = {
  headshots: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_HEADSHOTS!,
  "multi-purpose": process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MULTI!,
};

export default function UploadPage() {
  const router = useRouter();
  const { packId: _packId } = useParams();
  const packId = Array.isArray(_packId) ? _packId[0] : _packId || "";
  const session = useSession();
  const userId = session?.user?.id;

  const { previewUrls, setPreviewUrls } = useUploadContext();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  }, [files, setPreviewUrls]);

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (!list || !userId) return;
      const arr = Array.from(list).slice(0, 10);
      setFiles(arr);
      setUploading(true);
      Promise.all(
        arr.map((file) =>
          supabase
            .storage
            .from("user-uploads")
            .upload(`${userId}/${packId}/${file.name}`, file, { upsert: true })
        )
      )
        .catch(console.error)
        .finally(() => setUploading(false));
    },
    [userId, packId]
  );

  const removeFile = useCallback((i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const goNext = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    setIsLoading(true);

    // Detect correct pack type
    let packType: "headshots" | "multi-purpose" = "headshots";
    if (packId.includes("multi")) {
      packType = "multi-purpose";
    }

    const stripePriceId = PRICE_IDS_CLIENT[packType];

    console.log("Sending to /api/create-checkout-session:", {
      stripePriceId,
      user_id: userId,
      user_email: session.user?.email || "",
      packId,
      packType,
    });

    const resp = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stripePriceId,
        user_id: userId,
        user_email: session.user?.email || "",
        packId,
        packType,
      }),
    });

    if (!resp.ok) {
      console.error("create-checkout-session failed:", await resp.text());
      alert("Stripe checkout failed");
      setIsLoading(false);
      return;
    }

    const { url } = await resp.json();
    if (!url) {
      alert("Stripe checkout URL was missing.");
      setIsLoading(false);
      return;
    }

    window.location.href = url;
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center mb-6 text-gray-700 hover:text-sage-green"
      >
        <FiArrowLeft className="mr-2" /> Back
      </button>

      <h1 className="text-2xl text-charcoal font-bold mb-2">Upload your photos</h1>
      <p className="text-gray-600 mb-6">
        Select at least <span className="font-semibold">4–6</span> photos (max 10).
      </p>

      <div
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-muted-gold rounded-xl p-8 text-center hover:border-sage-green transition cursor-pointer"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => onFiles(e.target.files)}
        />
        <FiUploadCloud className="mx-auto mb-4 text-4xl text-muted-gold" />
        <Button variant="outline">Browse files</Button>
        <p className="mt-2 text-sm text-gray-500">or drag & drop your photos here</p>
      </div>

      {previewUrls.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          {previewUrls.map((url: string, i: number) => (
            <div key={i} className="relative w-full h-24">
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 z-10 bg-charcoal rounded-full p-1 text-muted-gold hover:text-sage-green"
              >
                <FiTrash2 size={16} />
              </button>
              <img
                src={url}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Selfies", desc: "Frontal, well-lit at eye-level", img: "/placeholders/selfie.png" },
          { title: "Variety", desc: "Different outfits & backgrounds", img: "/placeholders/variety.png" },
          { title: "No Blurry", desc: "Sharp, not too dark or bright", img: "/placeholders/no-blurry.png" },
          { title: "Natural", desc: "Avoid heavy filters or edits", img: "/placeholders/natural.png" },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-4 p-4 bg-ivory rounded-lg shadow hover:shadow-lg transition"
          >
            <img src={card.img} alt={card.title} className="w-16 h-16 rounded-md object-cover" />
            <div>
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-charcoal border-t p-4 flex justify-end items-center">
        <span className="self-center mr-auto text-sm text-ivory">
          {previewUrls.length} of 4 required{uploading ? " (uploading…)" : ""}
        </span>
        <Button
          disabled={previewUrls.length < 4 || isLoading}
          onClick={goNext}
          className={isLoading ? "bg-warm-gray text-white" : ""}
        >
          {isLoading ? (
            <>
              <FiLoader className="animate-spin mr-2" />
              Starting…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}
