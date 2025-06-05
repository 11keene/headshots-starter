"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface GeneratedImageRow {
  pack_id: string;
  image_url: string;
}

export default function StatusPage({ params }: { params: { packId: string } }) {
  const { packId } = params;
  const supabase = createClientComponentClient();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

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

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: 50 }}>Loading your images…</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 50, color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>Your images are ready!</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 8,
              textAlign: "center",
            }}
          >
            <img
              src={img}
              alt={`Generated #${idx + 1}`}
              style={{ width: "100%", height: "auto", borderRadius: 4 }}
            />
            <a
              href={img}
              download={`image_${idx + 1}.png`}
              style={{
                display: "inline-block",
                marginTop: 8,
                color: "#006aff",
                textDecoration: "none",
              }}
            >
              Download Image #{idx + 1}
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
