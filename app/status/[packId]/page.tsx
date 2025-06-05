// File: app/status/[packId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type GeneratedImageRow = {
  prompt_id: string;
  image_url: string | null;
  created_at: string;
};

export default function StatusPage({ params }: { params: { packId: string } }) {
  const supabase = createClientComponentClient();
  const { packId } = params;

  // Hold an array of { prompt_id, image_url, created_at }
  const [images, setImages] = useState<GeneratedImageRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all generated_images rows for this packId
  async function fetchImages() {
    const { data, error } = await supabase
      .from("generated_images")
      .select("prompt_id, image_url, created_at")
      .eq("pack_id", packId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching generated_images:", error);
      return;
    }
    if (data) {
      setImages(data as GeneratedImageRow[]);
    }
    setIsLoading(false);
  }

  // Poll every 5 seconds to check if any rows have received their image_url
  useEffect(() => {
    fetchImages(); // initial load

    const interval = setInterval(() => {
      fetchImages();
    }, 5000); // every 5s

    return () => clearInterval(interval);
  }, [packId]);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Your AI-Generated Images</h1>

      {isLoading && (
        <p className="text-gray-600">Loading status…</p>
      )}

      {!isLoading && images.length === 0 && (
        <p className="text-gray-600">
          No generated images found yet. Please wait a moment.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {images.map((row, idx) => (
          <div
            key={row.prompt_id}
            className="border rounded-lg overflow-hidden bg-gray-50"
          >
            {row.image_url ? (
              <img
                src={row.image_url}
                alt={`Generated prompt ${idx + 1}`}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-200 text-gray-500">
                <span>Waiting…</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
