// File: app/overview/packs/[packId]/generate/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function GeneratePage() {
  const params = useParams();
  const packId = Array.isArray(params?.packId)
    ? params.packId[0]
    : params?.packId || "";
  const searchParams = useSearchParams();
  const extraPacks = searchParams?.get("extraPacks") || "";

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function startJobs() {
      const uploaded: string[] =
        JSON.parse(localStorage.getItem(`uploads-${packId}`) || "[]");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) {
        console.error("[GeneratePage] no user signed in");
        return;
      }

      const payload = {
        userId: user.id,
        packs: [
          { inputs: uploaded, numOutputs: uploaded.length }
        ],
      };
      console.log("[GeneratePage] /api/start-astria payload:", payload);

      const resp = await fetch("/api/start-astria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("[GeneratePage] start-astria error:", resp.status, errText);
        return;
      }

      const json = await resp.json();
      console.log("[GeneratePage] start-astria success:", json);
    }
    startJobs();
  }, [packId, extraPacks, supabase]);

  return (
    <div className="p-8 text-center">
      <Spinner />
      <h1 className="text-2xl font-bold mt-6 mb-2">Order Processed!</h1>
      <p className="text-gray-600">Your images are now being generated…</p>
    </div>
  );
}
