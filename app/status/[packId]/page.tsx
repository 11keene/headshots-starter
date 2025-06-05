"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FiCheckSquare, FiDownloadCloud } from "react-icons/fi";

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
  const [error, setError] = useState<string>("");
  const [selectAll, setSelectAll] = useState<boolean>(false);

  useEffect(() => {
    async function loadGeneratedImages() {
      try {
        const { data: rows, error: supaErr } = await supabase
          .from("generated_images")
          .select("image_url")
          .eq("pack_id", packId);

        if (supaErr) throw supaErr;

        if (!rows || rows.length === 0) {
          setError("Your images are still being generated. Please check back shortly.");
          setLoading(false);
          return;
        }

        const urls = (rows as GeneratedImageRow[])
          .filter((row) => row.image_url)
          .map((row) => row.image_url);

        console.log(`📸 Loaded ${urls.length} images from Supabase for pack ${packId}`);

        setImages(urls);
        setLoading(false);
      } catch (e: any) {
        console.error("[StatusPage] Error loading images:", e);
        setError("There was an error loading your images. Please try again later.");
        setLoading(false);
      }
    }

    loadGeneratedImages();
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

  const downloadAll = () => {
    selected.forEach((url) => {
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", url.split("/").pop() || "image.png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (loading) {
    return <div className="text-center mt-12 text-xl text-gray-600">Hang tight — we’re preparing your photos…</div>;
  }

  if (error) {
    return <div className="text-center mt-12 text-red-600 text-lg">{error}</div>;
  }

  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto bg-black min-h-screen">
      <h1 className="text-4xl font-bold text-center text-muted-gold mb-3">
        🎉 Your AI Maven Photoshoot is Complete!
      </h1>
      <p className="text-center text-white text-lg mb-8 max-w-3xl mx-auto">
        Your brand-new gallery is ready! Click to select your favorite shots — or download the entire collection and start showing off your new look.
      </p>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button
          onClick={handleSelectAll}
          className="border border-muted-gold px-4 py-2 rounded text-white hover:bg-[#1E2A2D] hover:text-white transition"
        >
          {selectAll ? "Deselect All" : "Select All"}
        </button>

        <button
          onClick={downloadAll}
          disabled={selected.size === 0}
          className="bg-sage-green hover:bg-[#66735F] text-white font-semibold py-2 px-4 rounded flex items-center gap-2 disabled:opacity-40"
        >
          <FiDownloadCloud className="text-lg" />
          Download Selected ({selected.size})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`relative group rounded-xl shadow-md overflow-hidden border-2 p-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
              selected.has(img) ? "border-[#77836B]" : "border-transparent"
            }`}
            onClick={() => toggleSelect(img)}
          >
            <img
              src={img}
              alt={`Generated #${idx + 1}`}
              className="w-full h-auto object-cover rounded-lg"
            />
            <div className="absolute bottom-2 left-2 text-xs bg-white/90 px-2 py-1 rounded font-medium text-[#1E2A2D] shadow-sm">
              Image #{idx + 1}
            </div>
            {selected.has(img) && (
              <FiCheckSquare className="absolute top-2 right-2 text-[#77836B] text-xl bg-white rounded-full shadow" />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
