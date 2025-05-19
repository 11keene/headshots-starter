"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiUploadCloud, FiArrowLeft, FiTrash2, FiLoader } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useUploadContext } from "../UploadContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";
import { loadStripe } from "@stripe/stripe-js";

const supabase = createClientComponentClient();
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PRICE_IDS_CLIENT: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_PACK!,
  themed: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_THEMED_PACKS!,
  custom: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_CUSTOM_PACK!,
};

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const paramsObj = useParams();
  const packId = Array.isArray(paramsObj?.packId)
    ? paramsObj.packId[0]
    : paramsObj?.packId || "";
  const router = useRouter();
  const params = useSearchParams();
  const extraPacks = params?.get("extraPacks") || "";
  const gender = params?.get("gender") || "";

  const session = useSession();
  const userId = session?.user.id;

  const { previewUrls, setPreviewUrls } = useUploadContext();
  const [files, setFiles] = useState<File[]>([]);

  // rebuild previewUrls when files change
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
  }, [files, setPreviewUrls]);

  // on file select: set files and start background upload
  const onFiles = useCallback((fList: FileList | null) => {
    if (!fList) return;
    const arr = Array.from(fList).slice(0, 10);
    setFiles(arr);

    if (!userId || !packId) return;
    setUploading(true);
    Promise.all(
      arr.map((file) => {
        const path = `${userId}/${packId}/${file.name}`;
        return supabase.storage.from("user-uploads").upload(path, file, { upsert: true });
      })
    )
      .catch((err) => console.error("❌ Fire-and-forget upload error:", err))
      .finally(() => setUploading(false));
  }, [userId, packId]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  // upload only Stripe session and redirect
  const goNext = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }
    setIsLoading(true);

    // create Checkout session
    const stripePriceId = PRICE_IDS_CLIENT[
      packId.startsWith("starter") ? "starter" : packId.startsWith("themed") ? "themed" : "custom"
    ];
    const extrasPriceIds = extraPacks
      ? extraPacks.split(",").map(() => process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_EXTRA_HEADSHOT!).filter(Boolean)
      : [];

    const resp = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stripePriceId,
        user_id: userId,
        user_email: session.user?.email || "",
        packId,
        extras: extrasPriceIds,
      }),
    });
    if (!resp.ok) {
      console.error("❌ create-checkout-session error:", await resp.text());
      setIsLoading(false);
      return;
    }
    const { url } = await resp.json();
    if (!url) {
      console.error("❌ No session URL returned from Stripe");
      setIsLoading(false);
      return;
    }

    // redirect to Stripe Checkout
    window.location.href = url;
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push(`/overview/packs/${packId}/upsell?gender=${gender}`)}
        className="inline-flex items-center mb-6 text-gray-700 hover:text-sage-green"
      >
        <FiArrowLeft className="mr-2" /> Back to Extras
      </button>

      <h1 className="text-2xl text-charcoal font-bold mb-2">Upload your photos</h1>
      <p className="text-gray-600 mb-6">
        Select at least <span className="font-semibold">6</span> photos (max 10).
      </p>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-dusty-coral rounded-xl p-8 text-center hover:border-sage-green transition cursor-pointer"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => onFiles(e.target.files)}
        />
        <FiUploadCloud className="mx-auto mb-4 text-4xl text-dusty-coral" />
        <Button variant="outline">Browse files</Button>
        <p className="mt-2 text-sm text-gray-500">
          or drag & drop your photos here (PNG, JPG, WEBP up to 120 MB)
        </p>
      </div>

      {previewUrls.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative w-full h-24">
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 z-10 bg-ivory rounded-full p-1 text-dusty-coral hover:text-sage-green shadow"
              >
                <FiTrash2 size={16} />
              </button>
              <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Retain the instructions cards below */}
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

      <div className="fixed bottom-0 left-0 right-0 bg-ivory border-t p-4 flex justify-end">
        <span className="self-center mr-auto text-sm text-warm-gray">
          {previewUrls.length} of 6 required{uploading ? " (uploading...)" : ""}
        </span>
        <Button
          disabled={previewUrls.length < 6 || isLoading}
          onClick={goNext}
          className={`inline-flex items-center ${isLoading ? "bg-warm-gray text-white" : ""}`}>
          {isLoading ? (
            <><FiLoader className="animate-spin mr-2" /> Starting…</>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}