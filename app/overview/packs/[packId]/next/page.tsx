// File: app/overview/packs/[packId]/next/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiUploadCloud, FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useUploadContext } from "../UploadContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";

const supabase = createClientComponentClient();

export default function UploadPage() {
  const paramsObj = useParams();
  const packId = Array.isArray(paramsObj?.packId)
    ? paramsObj.packId[0]
    : paramsObj?.packId || "";
  const router = useRouter();
  const params = useSearchParams();
  const extraPacks = params?.get("extraPacks") || "";

  const session = useSession();
  const userId = session?.user.id;

  const { previewUrls, setPreviewUrls } = useUploadContext();
  const [files, setFiles] = useState<File[]>([]);

  // hydrate files from previewUrls once
  useEffect(() => {
    if (!packId) return;
    setFiles(
      previewUrls.map(
        (url) => new File([], url.split("/").pop() || "upload.jpg")
      )
    );
  }, []);

  // rebuild previewUrls on files change
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
  }, [files, setPreviewUrls]);

  const onFiles = useCallback((fList: FileList | null) => {
    if (!fList) return;
    const arr = Array.from(fList);
    setFiles((prev) => [...prev, ...arr].slice(0, 10));
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  // ——— Step 6: upload, start tune, then redirect to status page ———
  const goNext = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    // 1) convert previews → actual Files
    const uploadFiles: File[] = await Promise.all(
      previewUrls.map(async (url) => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File(
          [blob],
          url.split("/").pop() || "upload.jpg",
          { type: blob.type }
        );
      })
    );

    // 2) push each File into Supabase Storage → collect public URLs
    const publicUrls: string[] = [];
    for (const file of uploadFiles) {
      const path = `${userId}/${packId}/${file.name}`;
      const { data, error: upErr } = await supabase.storage
        .from("user-uploads")
        .upload(path, file, { upsert: true });
      if (upErr || !data?.path) {
        console.error("Storage upload failed:", upErr);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(data.path);
      publicUrls.push(urlData.publicUrl);
    }

       // now: create a Stripe Checkout Session
       const checkoutResp = await fetch("/api/create-checkout-session", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           packId,
           extraPacks: extraPacks ? extraPacks.split(",") : [],
           imageCount: publicUrls.length,
           successUrl: `${window.location.origin}/overview/packs/${packId}/training?tuneId={CHECKOUT_SESSION_ID}`,
           cancelUrl: `${window.location.origin}/overview/packs/${packId}/next?extraPacks=${extraPacks}`,
         }),
       });
       const { url } = await checkoutResp.json();
       router.push(url);
      };
  // ————————————————————————————————————————————————————————————

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/overview/packs")}
        className="inline-flex items-center mb-6 text-gray-700 hover:text-sage-green"
      >
        <FiArrowLeft className="mr-2" /> Go Back to Packs
      </button>

      <h1 className="text-2xl text-charcoal font-bold mb-2">Upload your photos</h1>
      <p className="text-gray-600 mb-6">
        Select at least <span className="font-semibold">6</span> photos (max 10).{" "}
        Mix close-ups, selfies & mid-range shots to help the AI learn you best.
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
                title="Remove this photo"
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

      <div className="fixed bottom-0 left-0 right-0 bg-ivory border-t p-4 flex justify-end">
        <span className="self-center mr-auto text-sm text-warm-gray">
          {previewUrls.length} of 6 required
        </span>
        <Button
          disabled={previewUrls.length < 6}
          onClick={goNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
