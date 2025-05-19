"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";

export default function GeneratePage() {
  const { packId: rawPackId } = useParams();
  const packSlug = Array.isArray(rawPackId) ? rawPackId[0] : rawPackId || "";
  const session = useSession();
  const userId = session?.user.id;
  const supabase = createClientComponentClient();

  const [tuneId, setTuneId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1) Trigger tune creation via API
  useEffect(() => {
    if (!userId || !packSlug) return;

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
  }, [userId, packSlug]);

  // 2) Poll Supabase for status
  useEffect(() => {
    if (!tuneId) return;
    const interval = setInterval(async () => {
      const { data, error: fetchErr } = await supabase
        .from("astria_tunes")
        .select("status")
        .eq("tune_id", tuneId)
        .single();
      if (fetchErr) {
        console.error("❌ status fetch error:", fetchErr);
        return;
      }
      setStatus(data.status);
      if (data.status === "succeeded" || data.status === "failed") {
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [tuneId, supabase]);

  // 3) Render
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        🚨 Error: {error}
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      {!tuneId && (
        <>
          <Spinner />
          <h1 className="text-2xl font-bold mt-6 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Generating your custom tune…</p>
        </>
      )}

      {tuneId && status === "pending" && (
        <>
          <Spinner />
          <h1 className="text-2xl font-bold mt-6 mb-2">Training in progress...</h1>
        </>
      )}

      {tuneId && status === "succeeded" && (
        <h1 className="text-2xl font-bold mt-6 mb-2 text-green-600">✅ Your tune is ready!</h1>
      )}

      {tuneId && status === "failed" && (
        <h1 className="text-2xl font-bold mt-6 mb-2 text-red-600">❌ Training failed. Please try again.</h1>
      )}
    </div>
  );
}
