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
  const session = useSession();

  const fireImagesDelivered = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;
    const [firstName, lastName] = (user.user_metadata?.full_name || "").split(" ");
    await fetch("/api/images-delivered", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, firstName, lastName, packId }),
    });
  };

  const firePhotosReady = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;
    const [firstName, lastName] = (user.user_metadata?.full_name || "").split(" ");
    await fetch("/api/photos-ready", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, firstName, lastName, packId }),
    });
  };

  useEffect(() => {
    const storageKey = `purchase_complete_fired_${packId}`;
    if (!session || localStorage.getItem(storageKey)) return;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [stillGenerating, setStillGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [zipLoading, setZipLoading] = useState<boolean>(false);

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
      setError("Oops! Something went wrong retrieving your photos. Please try again in a bit.");
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

  const handleDownloadZip = async () => {
    setZipLoading(true);
    try {
      const res = await fetch(`/api/zip-download/${packId}`);
      if (!res.ok) throw new Error("Failed to fetch ZIP");
      const blob = await res.blob();
      await fireImagesDelivered();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-maven-gallery.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Oops! There was an error downloading your ZIP file. Please try again.");
      console.error("[ZIP Download Error]", err);
    }
    setZipLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <FiLoader className="animate-spin text-4xl text-muted-gold mb-4" />
      <p className="text-2xl font-semibold text-gray-700">
        Hang tight — our AI wizards are cooking up your photos!
      </p>
    </div>
  );

  if (stillGenerating) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50 text-center">
      <FiLoader className="animate-spin text-5xl text-sage-green mb-6" />
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">🌟 Your gallery is in the works!</h2>
      <p className="text-base sm:text-lg text-gray-700 max-w-md">
Check back shortly to view your new headshots. We’ll send you an email as soon as your photos are ready — be sure to check your Spam, Junk, or Promotions folder just in case.

      </p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-red-50">
      <h2 className="text-3xl font-bold text-red-600 mb-2">😢 Oops!</h2>
      <p className="text-lg text-red-600 max-w-md text-center">{error}</p>
    </div>
  );

  return (
    <main className="bg-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4">🎉 Your AI Maven Photoshoot is Ready!</h1>
        <p className="text-lg text-gray-300">
          Welcome to your custom gallery! Click images to select your favorites—or grab them all at once and start shining.
        </p>
      </div>

      {/* Collapsible Instructions */}
      <details className="bg-gray-800 text-white rounded-lg p-4 text-left text-sm mb-8 max-w-4xl mx-auto group">
        <summary className="cursor-pointer text-sage-green font-semibold text-base outline-none">
          📲 Tap here for instructions on how to download and save your photos
        </summary>

        <div className="mt-4 space-y-6">
          {/* iPhone Instructions */}
          <div>
            <h3 className="text-md font-bold mb-2">🍏 iPhone Instructions</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li><strong>Tap and Hold</strong> any photo to save it individually.</li>
              <li>Or tap <strong>“Download All as ZIP”</strong> below.</li>
              <li>Click <strong>“Download”</strong> when prompted.</li>
              <li>Tap the <strong>blue arrow ↓</strong> in Safari's URL bar to open your downloads.</li>
              <li>Tap the ZIP file → then tap <strong>“Preview Content.”</strong></li>
              <li>Use the <strong>Share icon</strong> to <strong>“Save to Files.”</strong></li>
              <li>Open the <strong>Files app</strong> → tap the ZIP to unzip.</li>
              <li>Inside the folder, tap <strong>Select</strong> → then <strong>“Select All.”</strong></li>
              <li>Tap the Share icon → then <strong>“Save X Images.”</strong></li>
            </ol>
          </div>

          {/* Android Instructions */}
          <div>
            <h3 className="text-md font-bold mb-2">🤖 Android Instructions</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li><strong>Tap and Hold</strong> any photo to save it individually to your gallery.</li>
              <li>Or tap <strong>“Download All as ZIP”</strong> below.</li>
              <li>When prompted, confirm the download and open the <strong>Files</strong> or <strong>My Files</strong> app.</li>
              <li>Find the ZIP file in your Downloads folder and tap it to unzip.</li>
              <li>Select all photos → tap the <strong>Share</strong> icon → then choose <strong>Save to Photos</strong>.</li>
            </ol>
          </div>

          <p className="text-sage-green font-medium">That’s it! Your full gallery will now be saved to your phone. 🎉</p>
        </div>
      </details>

      {/* Buttons */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <button
          onClick={handleSelectAll}
          className="w-full sm:w-auto px-5 py-2 border border-sage-green text-sage-green rounded-md hover:bg-sage-green hover:text-white transition"
        >
          {selectAll ? "Deselect All" : "Select All"}
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

      {/* Image Grid */}
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