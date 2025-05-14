// File: app/overview/packs/[packId]/generate/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { packs as packData } from "../../../../../data/packs";

export default function GeneratePage() {
  const params = useParams();
  const packId = Array.isArray(params?.packId)
    ? params.packId[0]
    : params?.packId || "";
  const searchParams = useSearchParams();
  const extraPacks = searchParams?.get("extraPacks") || "";
  const router = useRouter();

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function startJobs() {
      // 1) get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.error("[GeneratePage] no user signed in");
        return;
      }
      const userId = user.id;

      // 2) list uploaded files
      const { data: files, error: listError } = await supabase.storage
        .from("user-uploads")
        .list(`${userId}/${packId}`);
      if (listError) {
        console.error("[GeneratePage] failed to list uploads:", listError);
        return;
      }

      const publicUrls = files.map((f) => {
        const { data: urlData } = supabase.storage
          .from("user-uploads")
          .getPublicUrl(f.name);
        return urlData.publicUrl;
      });

      if (!publicUrls.length) {
        console.error("[GeneratePage] no uploaded images");
        router.push(`/overview/packs/${packId}/next?extraPacks=${extraPacks}`);
        return;
      }

      // 3) build prompt
      let promptText: string;
      if (packId === "custom") {
        // call your custom-prompt API to generate prompt from intake
        const intake = JSON.parse(
          localStorage.getItem(`intake-${packId}`) || "[]"
        );
        const resp = await fetch("/api/custom-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, intake }),
        });
        const { prompt } = await resp.json();
        promptText = prompt;
      } else {
        // use static template from data/packs
        const packInfo = packData.find((p) => p.id === packId);
        promptText = packInfo?.prompt_template || "";
      }
      console.log("[GeneratePage] packId:", packId, "extraPacks:", extraPacks);
      console.log("[GeneratePage] publicUrls:", publicUrls);
      console.log("[GeneratePage] promptText:", promptText);
      // 4) call start-astria
      const payload = { userId, packs: [{ prompt: promptText, inputs: publicUrls, numOutputs: publicUrls.length }] };
      console.log("[GeneratePage] calling /api/start-astria with payload:", payload);
      
      const startResp = await fetch("/api/start-astria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!startResp.ok) {
        console.error("[GeneratePage] astria error:", await startResp.text());
        return;
      }
      console.log("[GeneratePage] astria started");
    }

    startJobs();
  }, [packId, extraPacks, supabase, router]);

  return (
    <div className="p-8 text-center">
      <Spinner />
      <h1 className="text-2xl font-bold mt-6 mb-2">Order Processed!</h1>
      <p className="text-gray-600">Generating your images…</p>
    </div>
  );
}
