// File: app/status/[packId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { FiCheckSquare, FiDownloadCloud, FiLoader } from "react-icons/fi";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface GeneratedImageRow {
  pack_id: string;
  image_url: string;
}

export default function StatusPage({ params }: { params: { packId: string } }) {
  const { packId } = params;
  const router = useRouter();
const supabase = createClientComponentClient();
const session  = useSession();

 // ── Ping Zapier when images are delivered ──
  const fireImagesDelivered = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;
    const [firstName, lastName] = (user.user_metadata?.full_name || "").split(" ");
    await fetch("/api/images-delivered", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, firstName, lastName, packId }),
    });
  };

  // ── Ping Zapier when photos are ready ──
  const firePhotosReady = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;
    const [firstName, lastName] = (user.user_metadata?.full_name || "").split(" ");
    await fetch("/api/photos-ready", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, firstName, lastName, packId }),
    });
  };

  // ───── Purchase Complete Tagging ─────
  useEffect(() => {
    const storageKey = `purchase_complete_fired_${packId}`;
    if (!session || localStorage.getItem(storageKey)) {
      return;
    }
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        const [firstName, lastName] = (user.user_metadata?.full_name || "").split(" ");
        try {
          await fetch("/api/purchase-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              firstName: firstName || "",
              lastName: lastName || "",
            }),
          });
          localStorage.setItem(storageKey, "true");
        } catch (err) {
          console.error("Failed to send purchase_complete webhook", err);
        }
      }
    })();
  }, [session, supabase, packId]);

  // State for images and download
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [stillGenerating, setStillGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [zipLoading, setZipLoading] = useState<boolean>(false);

  // Fetch generated images every 5s
  async function loadGeneratedImages() {
    try {
      const { data: rows, error: supaErr } = await supabase
        .from("generated_images")
        .select("image_url")
        .eq("pack_id", packId);
      if (supaErr) throw supaErr;
      if (!rows || rows.length === 0) {
        setStillGenerating(true);
        setLoading(false);
        return;
      }
      const urls = (rows as GeneratedImageRow[])
        .map((r) => r.image_url)
        .filter(Boolean);
      setImages(urls);
      setError("");
      setStillGenerating(false);
      setLoading(false);
    } catch (e: any) {
      console.error("[StatusPage] Error loading images:", e);
      setError(
        "Oops! Something went wrong retrieving your photos. Please try again in a bit."
      );
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGeneratedImages();
    const intervalId = setInterval(loadGeneratedImages, 5000);
    return () => clearInterval(intervalId);
  }, [packId, supabase]);

  const toggleSelect = (url: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      return next;
    });

  const handleSelectAll = () => {
    setSelectAll((prev) => {
      if (prev) setSelected(new Set());
      else setSelected(new Set(images));
      return !prev;
    });
  };
  
  // Download selected images as ZIP
  async function downloadAll(selectedUrls: string[]) {
    if (!selectedUrls.length) {
      alert("No images selected!");
      return;
    }
    setZipLoading(true);
    const zip = new JSZip();
    const folder = zip.folder("headshots");
    await Promise.all(
      selectedUrls.map(async (url, idx) => {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const ext = url.split(".").pop()?.split(/[#?]/)[0] || "jpg";
        folder!.file(`headshot-${idx + 1}.${ext}`, blob);
      })
    );
    const content = await zip.generateAsync({ type: "blob" });

    // Fire images delivered event after ZIP is ready, before saving
await fireImagesDelivered();
    await firePhotosReady();

    saveAs(content, "selected-headshots.zip");
    setZipLoading(false);
  }

  const handleDownloadZip = async () => {
    setZipLoading(true);
    try {
      const res = await fetch(`/api/zip-download/${packId}`);
      if (!res.ok) throw new Error("Failed to fetch ZIP");
      const blob = await res.blob();
      await fireImagesDelivered();
            await firePhotosReady();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-maven-gallery.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(
        "Oops! There was an error downloading your ZIP file. Please try again."
      );
      console.error("[ZIP Download Error]", err);
    }
    setZipLoading(false);
  };

  // Render states...
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <FiLoader className="animate-spin text-4xl text-muted-gold mb-4" />
      <p className="text-2xl font-semibold text-gray-700">
        Hang tight — our AI wizards are cooking up your photos!
      </p>
    </div>
  );

  if (stillGenerating) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <FiLoader className="animate-spin text-5xl text-sage-green mb-4" />
      <h2 className="text-3xl font-bold text-gray-800">🌟 Your gallery is in the works!</h2>
      <p className="text-lg text-gray-600 max-w-md text-center">
        Our AI is painting your masterpiece. Check back in a moment to see your new headshots!
      </p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-red-50">
      <h2 className="text-3xl font-bold text-red-600 mb-2">😢 Oops!</h2>
      <p className="text-lg text-red-600 max-w-md text-center">{error}</p>
    </div>
  );
  

  // ─────────────────────────────────────────────────────────────────────────────
  // Images grid & download controls
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <main className="bg-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4">🎉 Your AI Maven Photoshoot is Ready!</h1>
        <p className="text-lg text-gray-300">
          Welcome to your custom gallery! Click images to select your favorites—or grab them all at once and start shining.
        </p>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <button
          onClick={handleSelectAll}
          className="w-full sm:w-auto px-5 py-2 border border-sage-green text-sage-green rounded-md hover:bg-sage-green hover:text-white transition"
        >
          {selectAll ? "Deselect All" : "Select All"}
        </button>

        <button
          onClick={() => downloadAll(Array.from(selected))}
          disabled={selected.size === 0 || zipLoading}
          className="w-full sm:w-auto px-5 py-2 bg-sage-green text-white rounded-md disabled:opacity-50 transition inline-flex items-center gap-2"
        >
          <FiDownloadCloud className="text-xl" />
          {zipLoading ? "Preparing ZIP…" : `Download Selected (${selected.size})`}
        </button>

        <button
          onClick={handleDownloadZip}
          disabled={zipLoading}
          className="w-full sm:w-auto px-5 py-2 bg-muted-gold text-[#1E2A2D] rounded-md disabled:opacity-50 transition inline-flex items-center gap-2"
        >
          <FiDownloadCloud className="text-xl" />
          {zipLoading ? "Zipping Up…" : "Download All as ZIP"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => toggleSelect(img)}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 p-1 transform hover:scale-105 transition ${
              selected.has(img) ? "border-sage-green" : "border-transparent"
            }`}
          >
            <img src={img} alt={`Generated #${idx + 1}`} className="w-full h-auto object-cover rounded-md" />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
              #{idx + 1}
            </div>
            {selected.has(img) && (
              <FiCheckSquare className="absolute top-2 right-2 text-sage-green bg-white rounded-full p-1 shadow" />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
