// File: app/generating/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function GeneratingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const session_id = params.get("session_id");
  const packId = params.get("packId");
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id || !packId) {
      setStatus("error");
      setErrorMsg("Missing session_id or packId");
      return;
    }

    setStatus("running");
    fetch(`/api/generating?session_id=${session_id}&packId=${packId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Unknown error");
        }
        return res.json();
      })
      .then(() => {
        setStatus("done");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.message);
      });
  }, [session_id, packId]);

  if (status === "idle" || status === "running") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl">We’re creating your custom AI tune…</h2>
        <p className="mt-4">This may take a few moments. Please don’t refresh.</p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl text-green-600">Success!</h2>
        <p className="mt-4">Your prompts have been sent. You’ll see your images shortly.</p>
      </div>
    );
  }

  // status === "error"
  return (
    <div className="p-8 text-center text-red-600">
      <h2 className="text-2xl">Something went wrong</h2>
      <p className="mt-4">{errorMsg || "Unknown error"}</p>
    </div>
  );
}
