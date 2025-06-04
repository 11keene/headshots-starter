// File: app/status/[packId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type GenerationStatus =
  | "idle"
  | "fetchingExistingImages"
  | "displayingExistingImages"
  | "pollingAstria"
  | "done"
  | "error";

export default function StatusPage({ params }: { params: { packId: string } }) {
  const { packId } = params;
  const supabase = createClientComponentClient();

  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    async function loadOrPoll() {
      // ──────────── Step 1) Look for Astria results in `generated_images` ────────────
      setStatus("fetchingExistingImages");
      console.log("[StatusPage] Checking Supabase for generated_images of packId =", packId);

      const { data: existingGen, error: fetchGenErr } = await supabase
        .from("generated_images")
        .select("image_url")
        .eq("pack_id", packId);

      if (fetchGenErr) {
        console.error("[StatusPage] Error fetching generated_images:", fetchGenErr);
        setErrorMessage("Failed to fetch generated images.");
        setStatus("error");
        return;
      }

      if (existingGen && existingGen.length > 0) {
        // ── 1A) Astria has already returned results → display them
        const urls = existingGen.map((row: any) => row.image_url);
        console.log("[StatusPage] Found generated_images rows:", urls);
        setImageUrls(urls);
        setStatus("displayingExistingImages");
        return;
      }

      // ── 1B) No `generated_images` yet → wait/poll for Astria webhook
      console.log("[StatusPage] No generated_images yet; polling Astria every 2s.");
      setStatus("pollingAstria");

      const intervalId = setInterval(async () => {
        console.log(`[StatusPage] Polling generated_images for packId ${packId}`);
        const { data: checkRows, error: checkErr } = await supabase
          .from("generated_images")
          .select("image_url")
          .eq("pack_id", packId);

        if (checkErr) {
          console.error("[StatusPage] Polling generated_images error:", checkErr);
          clearInterval(intervalId);
          setErrorMessage("Error while polling for Astria images.");
          setStatus("error");
          return;
        }

        if (checkRows && checkRows.length > 0) {
          clearInterval(intervalId);
          const urls = checkRows.map((r: any) => r.image_url);
          console.log("[StatusPage] Astria images appeared:", urls);

          // ── Optional: insert into `images` if you want to store them there as well
          const rowsToInsert = urls.map((u) => ({
            pack_id: packId,
            url: u,
            created_at: new Date().toISOString(),
          }));
          const { error: insertErr } = await supabase.from("images").insert(rowsToInsert);
          if (insertErr) {
            console.error("[StatusPage] Could not insert into images table:", insertErr);
          } else {
            console.log("[StatusPage] ✅ Stored images in Supabase `images` table");
          }

          // Finally display them
          setImageUrls(urls);
          setStatus("done");
        }
        // else: keep waiting
      }, 2000);

      // Exit so we never run any generate-prompts logic
      return;
    }

    loadOrPoll();
  }, [packId, supabase]);

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      {status === "fetchingExistingImages" && (
        <p className="text-lg">Looking for your images…</p>
      )}

      {status === "displayingExistingImages" && (
        <>
          <h2 className="text-2xl font-bold mb-4">Your images are ready!</h2>
          <div className="grid grid-cols-1 gap-4">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <img
                  src={url}
                  alt={`Generated #${idx + 1}`}
                  className="w-64 h-64 object-cover rounded-lg mb-2"
                />
                <a
                  href={url}
                  download={`pack_${packId}_image_${idx + 1}.png`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Download Image #{idx + 1}
                </a>
              </div>
            ))}
          </div>
        </>
      )}

      {status === "pollingAstria" && (
        <p className="text-xl font-medium">⏳ Waiting for images to finish…</p>
      )}

      {status === "done" && imageUrls.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4">🎉 Your images are ready!</h2>
          <div className="flex flex-col items-center">
            <img
              src={imageUrls[0]}
              alt="Generated headshot"
              className="w-64 h-64 object-cover rounded-lg mb-2"
            />
            <a
              href={imageUrls[0]}
              download={`pack_${packId}_image.png`}
              className="text-sm text-blue-600 hover:underline"
            >
              Download Image
            </a>
          </div>
        </>
      )}

      {status === "error" && (
        <p className="text-red-600 mt-4">Error: {errorMessage}</p>
      )}
    </div>
  );
}
