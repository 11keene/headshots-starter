"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { startAstria } from "@/utils/startAstria";
import { packs as packData } from "../../../../../data/packs";

export default function GeneratePage() {
  const params = useParams();
  const packSlug = Array.isArray(params?.packId)
    ? params.packId[0]
    : params?.packId || "";

  const extraPacks = useSearchParams()?.get("extraPacks") || "";
  const gender      = useSearchParams()?.get("gender")    || "";
  const router      = useRouter();
  const supabase    = createClientComponentClient();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function startJobs() {
      // 1) get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.error("no user");
        return;
      }
      const userId = user.id;

      // 2) list files they just uploaded
      const folder = `${userId}/${packSlug}`;
      const { data: files, error } = await supabase
        .storage
        .from("user-uploads")
        .list(folder);

      if (error || !files?.length) {
        console.error("no images, bounce back");
        router.push(`/overview/packs/${packSlug}/next?extraPacks=${extraPacks}&gender=${gender}`);
        return;
      }
      const publicUrls = files.map(f =>
        supabase.storage
          .from("user-uploads")
          .getPublicUrl(`${folder}/${f.name}`)
          .data.publicUrl
      );

      // 3) build prompts (static vs custom)
      let prompts: string[];
      if (packSlug === "custom") {
        const intake = JSON.parse(localStorage.getItem(`intake-${packSlug}`) || "[]");
        const res = await fetch("/api/custom-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, intake }),
        });
        const { prompt } = await res.json();
        prompts = prompt.split("\n").map((l: string) => l.trim()).filter(Boolean);
      } else {
        const template = packData.find(p => p.id === packSlug)?.prompt_template || "";
        prompts = template.split("\n").map(l => l.trim()).filter(Boolean);
      }

      // 4) fetch the user’s tune_id for this pack from Supabase
      const { data: tunes } = await supabase
        .from("tunes")
        .select("tune_id")
        .eq("user_id", userId)
        .eq("pack_type", packSlug)
        .limit(1)
        .single();

      const modelId = tunes?.tune_id;
      if (!modelId) {
        console.error("no tune for", packSlug);
        return;
      }

      // 5) kick off Astria generate
      try {
        const jobs = await startAstria({ modelId, prompts, inputs: publicUrls });
        console.log("Astria jobs:", jobs);
        // …now write results back and email the user…
      } catch (err) {
        console.error("Astria error", err);
      }

      setLoading(false);
    }

    startJobs();
  }, [packSlug, extraPacks, gender, router, supabase]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Spinner />
        <h1 className="text-2xl font-bold mt-6 mb-2">Order Processed!</h1>
        <p className="text-gray-600">Generating your images…</p>
      </div>
    );
  }

  return <div>Check your inbox—you’re all set! 🎉</div>;
}
