"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";

export default function GeneratePage() {
  const params = useParams();
  const rawPackId = params?.packId;
  const packSlug = Array.isArray(rawPackId) ? rawPackId[0] : rawPackId || "";
  const basePack = packSlug.replace(/-(man|woman)$/, "");
  const session = useSession();
  const userId = session?.user.id;
  const supabase = createClientComponentClient();

  const [tuneId, setTuneId] = useState<number | null>(null);
  const [status, setStatus] = useState<"training"|"pending"|"succeeded"|"failed">("training");
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  // 0️⃣ Check for an existing tune to avoid duplicate charges
  useEffect(() => {
    if (!userId || !basePack) return;
    (async () => {
      try {
        const { data: existing, error: existingErr } = await supabase
          .from("astria_tunes")
          .select("tune_id,status")
          .eq("user_id", userId)
          .eq("pack_id", basePack)
          .single();
        if (existingErr) {
          console.error("❌ existing tune fetch error:", existingErr);
        }
        if (existing) {
          // resume from existing tune
          setTuneId(existing.tune_id);
          setStatus(existing.status as any);
        }
      } catch (e: any) {
        console.error("❌ error checking existing tune:", e);
      }
    })();
  }, [userId, basePack, supabase]);

  // 1️⃣ Kick off fine-tune if none exists
  useEffect(() => {
    if (!userId || !packSlug || tuneId) return;
    setStatus("training");
    fetch("/api/astria/create-tune", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, packId: packSlug }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTuneId(data.tuneId);
        setStatus("pending");
      })
      .catch((err) => {
        console.error("❌ create-tune error:", err);
        setError(err.message);
      });
  }, [userId, packSlug, tuneId]);

  // 2️⃣ Poll Supabase for training status
  useEffect(() => {
    if (!tuneId) return;
    const iv = setInterval(async () => {
      const { data, error: e } = await supabase
        .from("astria_tunes")
        .select("status")
        .eq("tune_id", tuneId)
        .single();
      if (e) {
        console.error("❌ status fetch error:", e);
        setError(e.message);
        clearInterval(iv);
        return;
      }
      setStatus(data.status as any);
      if (data.status === "succeeded" || data.status === "failed") {
        clearInterval(iv);
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [tuneId, supabase]);

  // 3️⃣ Once tuned, generate all user images
  useEffect(() => {
    if (status !== "succeeded" || !tuneId) return;

    (async () => {
      try {
        // a) fetch the user's uploaded photos
        const folder = `${userId}/${packSlug}`;
        const { data: files, error: filesErr } = await supabase
          .storage
          .from("user-uploads")
          .list(folder);
        if (filesErr) throw filesErr;
        const image_urls = files!.map((f) =>
          supabase
            .storage
            .from("user-uploads")
            .getPublicUrl(`${folder}/${f.name}`)
            .data.publicUrl
        );

        // b) fetch prompts
        const gender = /-woman$/.test(packSlug) ? "woman" : "man";
        const { data: promptsData, error: pErr } = await supabase
          .from("prompt_templates")
          .select("prompt_text")
          .eq("pack_id", basePack)
          .eq("gender", gender)
          .order("sort_order", { ascending: true });
        if (pErr) throw pErr;
        const prompts = promptsData!.map((p) => p.prompt_text);

        // c) call Astria generate
        const resp = await fetch(
          `https://api.astria.ai/tunes/${tuneId}/generations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ASTRIA_API_KEY!}`,
            },
            body: JSON.stringify({ prompts, image_urls, steps: 50 }),
          }
        );
        const gen = await resp.json();
        if (!resp.ok) throw new Error(gen.error || "Generate failed");
        setImages(gen.generations.map((g: any) => g.url));
      } catch (genErr: any) {
        console.error("❌ generate error:", genErr);
        setError(genErr.message || String(genErr));
      }
    })();
  }, [status, tuneId, userId, packSlug, basePack, supabase]);

  // ——— RENDER ———
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        🚨 Error: {error}
      </div>
    );
  }

  if (status === "training" || status === "pending") {
    return (
      <div className="p-8 text-center">
        <Spinner />
        <h1 className="text-2xl font-bold mt-6 mb-2">
          {status === "training"
            ? "Order Confirmed!"
            : "Training in progress..."}
        </h1>
        <p className="text-gray-600">
          {status === "training"
            ? "Generating your custom tune…"
            : "Please wait while we finish training."}
        </p>
      </div>
    );
  }

  // tuning succeeded but still generating images
  if (images.length === 0) {
    return (
      <div className="p-8 text-center">
        <Spinner />
        <h1 className="text-2xl font-bold mt-6 mb-2">
          Generating your images…
        </h1>
      </div>
    );
  }

  // finally, show the gallery!
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Generated ${i + 1}`}
          className="w-full rounded-lg shadow-lg"
        />
      ))}
    </div>
  );
}
