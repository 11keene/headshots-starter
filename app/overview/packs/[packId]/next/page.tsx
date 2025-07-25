// File: app/overview/packs/[packId]/next/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiArrowLeft,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";
import { v4 as uuidv4 } from "uuid";

// You already had these in .env.local
const PRICE_IDS_CLIENT: Record<"headshots" | "multi-purpose", string> = {
  headshots: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_HEADSHOTS!,
  "multi-purpose": process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MULTI!,
};

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─ Gender
  const rawGender = searchParams.get("gender")?.toLowerCase() || null;
  const gender = rawGender === "woman" ? "woman" : rawGender === "man" ? "man" : null;

  // ─ Pack ID
  const { packId: _packId } = useParams();
  const packId = Array.isArray(_packId) ? _packId[0] : _packId || "";

  const supabase = createClientComponentClient();
  const session = useSession();
  const userId = session?.user?.id || null;

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────── Proxy helper to fire upload_complete tag ───────────
  const sendUploadComplete = async (email: string, firstName: string, lastName: string) => {
    try {
      await fetch('/api/upload-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName }),
      });
    } catch (err) {
      console.error('Failed to send upload_complete proxy request', err);
    }
  };

  // 2) Generate previews
  useEffect(() => {
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  }, [files]);

  // 3) Count existing uploads
  useEffect(() => {
    if (!packId) return;
    (async () => {
      const { data: existingUploads, error: countErr } = await supabase
        .from("uploads")
        .select("id")
        .eq("pack_id", packId);
      if (!countErr) setUploadCount(existingUploads?.length || 0);
    })();
  }, [packId, supabase]);

  // 4) Handle file drop or selection
  const onFiles = useCallback(
    (list: FileList | null) => {
      if (!list || !userId || !packId) return;
      setFiles(Array.from(list).slice(0, 10));
      setUploading(true);
      setError(null);

      Promise.all(
        Array.from(list).slice(0, 10).map(async (file) => {
          try {
            // a) Build a unique storage path: userId/packId/uuid.ext
            const ext = file.name.split(".").pop();
            const fileName = `${uuidv4()}.${ext}`;
            const filePath = `${userId}/${packId}/${fileName}`;

            // b) Upload to Supabase Storage bucket "user-uploads"
            console.log("[UploadPage] Uploading to storage:", filePath);
            const { error: storageErr } = await supabase.storage
              .from("user-uploads")
              .upload(filePath, file, { cacheControl: "3600", upsert: false });
            if (storageErr) {
              console.error("[UploadPage] Storage error:", storageErr);
              throw storageErr;
            }

            // c) Get public URL
            const { data: urlData } = supabase.storage
              .from("user-uploads")
              .getPublicUrl(filePath);
            const publicUrl = urlData.publicUrl;
            if (!publicUrl) {
              throw new Error("Failed to get public URL.");
            }
            console.log("[UploadPage] Received publicUrl:", publicUrl);

            // d) Insert a row into `uploads`
            console.log(
              "[UploadPage] Inserting into uploads table:",
              { user_id: userId, pack_id: packId, url: publicUrl }
            );
            const { error: insertErr } = await supabase.from("uploads").insert({
              user_id: userId,
              pack_id: packId,
              url: publicUrl,
              created_at: new Date().toISOString(),
            });
            if (insertErr) {
              console.error("[UploadPage] Insert error:", insertErr);
              throw insertErr;
            }
            console.log("[UploadPage] Inserted upload row for", publicUrl);

            // e) After insert succeeds, re‐count how many rows exist
            const { data: newUploads, error: newCountErr } = await supabase
              .from("uploads")
              .select("id")
              .eq("pack_id", packId);

            if (newCountErr) {
              console.error("[UploadPage] Error recounting uploads:", newCountErr);
            } else {
              const newCount = newUploads?.length || 0;
              console.log(
                `[UploadPage] Updated uploadCount after upload: ${newCount}`
              );
              setUploadCount(newCount);
            }
          } catch (err: any) {
            console.error("[UploadPage] Upload error for one file:", err);
            throw err;
          }
        })
      )
        .then(async () => {
          // All uploads succeeded, now fire the webhook
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            const [firstName, lastName] = (user.user_metadata?.full_name || '').split(' ');
            await sendUploadComplete(user.email, firstName || '', lastName || '');
          }
        })
        .catch((uploadErr) => {
          console.error("[UploadPage] Promise.all uploadErr:", uploadErr);
          setError(uploadErr.message || "Upload failed");
        })
        .finally(() => {
          setUploading(false);
          console.log("[UploadPage] Finished uploading batch; uploading =", false);
        });
    },
    [userId, packId, supabase]
  );

  // 5) Remove a preview (does not delete from Supabase)
  const removeFile = useCallback(
    (i: number) => {
      console.log("[UploadPage] Removing preview index", i);
      const newFiles = files.filter((_, idx) => idx !== i);
      const newPreviews = previewUrls.filter((_, idx) => idx !== i);
      setFiles(newFiles);
      setPreviewUrls(newPreviews);

      // If user deletes all images, reset uploadCount
      if (newFiles.length === 0) {
        console.log("[UploadPage] All previews removed. Resetting upload count.");
        setUploadCount(0);
      }
    },
    [files, previewUrls]
  );

  // 6) Once uploadCount ≥ 4, enable “Continue” → Checkout
const goNext = () => {
  const checkbox = document.getElementById("termsCheckbox") as HTMLInputElement;

  if (!checkbox?.checked) {
    alert("Please confirm you agree to the terms before continuing.");
    
    // Scroll the checkbox into view
    checkbox.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // Optional: highlight it briefly for attention
    checkbox.classList.add("ring-2", "ring-red-500");
    setTimeout(() => {
      checkbox.classList.remove("ring-2", "ring-red-500");
    }, 2000);

    return;
  }

  if (!userId) {
    router.push("/login");
    return;
  }

  setIsLoading(true);

  let packType: "headshots" | "multi-purpose" = "headshots";
  if (packId.includes("multi")) packType = "multi-purpose";

  const stripePriceId = PRICE_IDS_CLIENT[packType];
  console.log(
    "[UploadPage] goNext: packId =", packId,
    "packType =", packType,
    "stripePriceId =", stripePriceId,
    "gender =", gender
  );

  fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stripePriceId,
      packId: packId,
      packType,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      window.location.href = data.url!;
    })
    .catch((err) => setError(err.message));
};



  return (
<div className="p-6 sm:p-8 max-w-3xl mx-auto pb-40 lg:pb-48">
      {/* Back buttosn */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center mb-6 text-gray-700 hover:text-sage-green"
      >
        <FiArrowLeft className="mr-2 " /> Back
      </button>

      <h1 className="text-2xl text-charcoal font-bold mb-2">
        Upload your photos 
      </h1>
      <p className="text-gray-600 mb-6">
        Select at least <span className="font-semibold">4–6</span> photos (max 10).
      </p>
<div className="mb-4 bg-amber-100 border-l-4 border-amber-400 text-amber-900 p-3 rounded">
  <p className="text-sm">
    <strong>Tip:</strong> Make sure the photos you upload match your intake answers — especially hairstyle, hair length, and overall appearance. For example, if you selected “long hair,” please upload images that reflect your current long hairstyle. This ensures the most accurate results.
  </p>
</div>

<div className="mb-6 rounded-lg border-2 border-muted-gold bg-charcoal p-4 flex items-start gap-3">
  {/* 👁️‍🗨️ Icon in muted-gold */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-muted-gold stroke-current"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>

  <div className="flex-1">
    <h2 className="text-lg font-semibold text-muted-gold">
      For best results, upload high-quality photos!
    </h2>
    <p className="mt-1 text-sm text-ivory">
      Our AI does its best work when you give it clear, well-lit images. Think: sharp focus, good lighting, no heavy filters—<strong>what you give is what you get</strong>. 📸✨
    </p>
  </div>
</div>

      {/* ─────────────────────────────────────────────────────────── */}


      {/* Dropzone */}
      <div
        onDrop={(e) => {
          e.preventDefault();
          console.log("[UploadPage] Drop event detected");
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
          onChange={(e) => {
            console.log("[UploadPage] File input change event");
            onFiles(e.target.files);
          }}
        />
        <FiUploadCloud className="mx-auto mb-4 text-4xl text-muted-gold" />
        <Button variant="outline">Browse files</Button>
        <p className="mt-2 text-sm text-gray-500">or drag & drop your photos here</p>
      </div>

      {/* Preview thumbnails */}
      {previewUrls.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          {previewUrls.map((url, i) => (
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

      {/* Guidelines cards (unchanged) */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: "Selfies",
            desc: "Frontal, well-lit at eye-level",
            img: "/Selfies.png",
          },
          {
            title: "Variety",
            desc: "Different outfits & backgrounds",
            img: "/variety1.png",
          },
          {
            title: "No Blurry",
            desc: "Sharp, not too dark or bright",
            img: "/Noblurry.png",
          },
          {
            title: "Natural",
            desc: "Avoid heavy filters or edits",
            img: "/Natural.jpg",
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-4 p-4 bg-ivory rounded-lg shadow hover:shadow-lg transition"
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
{/* Agreement Checkbox */}
<div className="mt-10">
  <label className="flex items-start space-x-2 text-sm text-gray-700">
    <input
      type="checkbox"
      id="termsCheckbox"
      className="mt-1"
    />
    <span>
      I understand this is a custom AI-generated product and that{" "}
      <strong>all sales are final and non-refundable</strong>. I am eligible for one complimentary re-render within 7 days of delivery. By continuing, I agree to the{" "}
      <a href="/terms" target="_blank" className="text-muted-gold underline">
        Terms of Service
      </a>.
    </span>
  </label>
</div>


      {/* Fixed footer with Continue button */}
      <div className="fixed bottom-0 left-0 right-0 bg-charcoal border-t p-4 flex justify-end items-center">
        <span className="self-center mr-auto text-sm text-ivory">
          {uploadCount} of 4 required{uploading ? " (uploading…)" : ""}
        </span>
        <Button
          disabled={uploading || uploadCount < 4 || isLoading}
          onClick={goNext}
        >
          {uploading 
            ? "Uploading…"
            : isLoading
              ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Starting…
                  </>
                )
              : "Continue"
          }
        </Button>
      </div>

      {error && (
        <p className="mt-4 text-center text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
