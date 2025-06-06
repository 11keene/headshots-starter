"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FiCheckSquare, FiDownloadCloud, FiLoader } from "react-icons/fi";

interface GeneratedImageRow {
  pack_id: string;
  image_url: string;
}

export default function StatusPage({ params }: { params: { packId: string } }) {
  const { packId } = params;
  const supabase = createClientComponentClient();
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

      // If no rows yet, we’re still generating
      if (!rows || rows.length === 0) {
        setStillGenerating(true);
        setLoading(false);
        return;
      }

      // Otherwise, we have at least one image
      const urls = (rows as GeneratedImageRow[])
        .filter((row) => row.image_url)
        .map((row) => row.image_url);

      console.log(`📸 Loaded ${urls.length} images for pack ${packId}`);

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
    // Initial load
    loadGeneratedImages();

    // Poll every 5s
    const intervalId = setInterval(() => {
      loadGeneratedImages();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [packId, supabase]);

  const toggleSelect = (url: string) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      newSet.has(url) ? newSet.delete(url) : newSet.add(url);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
    } else {
      setSelected(new Set(images));
    }
    setSelectAll(!selectAll);
  };

  // Download selected images individually
async function downloadAll(selectedUrls: string[]) {
  try {
    for (const astriaUrl of selectedUrls) {
      // 1) encode the Astria URL so it can be sent as a query string:
      const encoded = encodeURIComponent(astriaUrl);

      // 2) fetch from your proxy instead of directly from Astria
      const resp = await fetch(`/api/download-proxy?url=${encoded}`);

      if (!resp.ok) {
        console.error("Download proxy returned", resp.status);
        continue;
      }

      // 3) Turn the server-side streamed response into a blob
      const blob = await resp.blob();

      // 4) Create a temporary <a> to trigger download
      const disp = resp.headers.get("Content-Disposition") || "";
      // Attempt to parse a “filename=” from Content-Disposition
      let filename = "downloaded.jpg";
      const match = /filename="?([^"]+)"?/.exec(disp);
      if (match && match[1]) {
        filename = match[1];
      }

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  } catch (err) {
    console.error("Error in downloadAll:", err);
  }
}

  // Download everything as ZIP
  const handleDownloadZip = async () => {
    setZipLoading(true);
    try {
      const res = await fetch(`/api/zip-download/${packId}`);
      if (!res.ok) throw new Error("Failed to fetch ZIP");

      const blob = await res.blob();
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Render logic:
  // ─────────────────────────────────────────────────────────────────────────────
  // 1) While first loading from Supabase
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <FiLoader className="animate-spin text-4xl text-muted-gold mb-4" />
        <p className="text-2xl font-semibold text-gray-700">
          Hang tight — our AI wizards are cooking up your photos!
        </p>
      </div>
    );
  }

  // 2) If Supabase query succeeded but no images yet (still generating)
  if (stillGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center space-y-4">
          <FiLoader className="animate-spin text-5xl text-sage-green mx-auto" />
          <h2 className="text-3xl font-bold text-gray-800">
            🌟 Your gallery is in the works!
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Our AI is painting your masterpiece. Check back in a moment to see your new headshots!
          </p>
        </div>
      </div>
    );
  }

  // 3) If Supabase returned an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-red-50">
        <h2 className="text-3xl font-bold text-red-600 mb-2">😢 Oops!</h2>
        <p className="text-lg text-red-600 max-w-md text-center">{error}</p>
      </div>
    );
  }

  // 4) Otherwise, we have images to display
  return (
    <main className="bg-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-white mb-4">
          🎉 Your AI Maven Photoshoot is Ready!
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Welcome to your custom gallery! Click images to select your favorites—or grab them all at once and start shining.
        </p>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <button
          onClick={handleSelectAll}
          className="w-full sm:w-auto inline-flex justify-center items-center border border-sage-green text-sage-green hover:bg-sage-green hover:text-white px-5 py-2 rounded-md transition"
        >
          {selectAll ? "Deselect All" : "Select All"}
        </button>

        <button
          onClick={() => downloadAll(Array.from(selected))}
          disabled={selected.size === 0}
          className="w-full sm:w-auto inline-flex justify-center items-center bg-sage-green hover:bg-[#66735F] text-white font-medium px-5 py-2 rounded-md gap-2 disabled:opacity-50 transition"
        >
          <FiDownloadCloud className="text-xl" />
          Download Selected ({selected.size})
        </button>

        <button
          onClick={handleDownloadZip}
          disabled={zipLoading}
          className="w-full sm:w-auto inline-flex justify-center items-center bg-muted-gold hover:bg-[#B6A272] text-[#1E2A2D] font-medium px-5 py-2 rounded-md gap-2 disabled:opacity-50 transition"
        >
          <FiDownloadCloud className="text-xl" />
          {zipLoading ? "Zipping Up..." : "Download All as ZIP"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => toggleSelect(img)}
            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 p-1 transition-transform transform hover:scale-105 ${
              selected.has(img) ? "border-sage-green" : "border-transparent"
            }`}
          >
            <img
              src={img}
              alt={`Generated #${idx + 1}`}
              className="w-full h-auto object-cover rounded-md"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full shadow-sm">
              #{idx + 1}
            </div>
            {selected.has(img) && (
              <FiCheckSquare className="absolute top-2 right-2 text-sage-green text-2xl bg-white bg-opacity-90 rounded-full p-1 shadow" />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
