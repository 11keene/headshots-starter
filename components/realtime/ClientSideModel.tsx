// File: components/realtime/ClientSideModel.tsx
"use client";

import { useEffect, useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

interface ModelRow {
  id: number;
  user_id: string | null;
  name: string;               // ← made non-nullable to match ModelsTable
  // (we dropped `pack`/`characteristics` here since this component only
  // cares about the single-model view)
  fine_tuned_face_id: string;
  trained_at: string;
  created_at: string;
  status: string;
}

export default function ClientSideModel({ modelId }: { modelId: number }) {
  const [model, setModel] = useState<ModelRow | null>(null);
  const supabase = createPagesBrowserClient<Database>();

  useEffect(() => {
    // 1) initial fetch, now including `status`
    supabase
      .from("models")
      .select(
        [
          "id",
          "user_id",
          "name",               // ← name must be string
          "fine_tuned_face_id",
          "trained_at",
          "created_at",
          "status",
        ].join(",")
      )
      .eq("id", modelId)
      .single<{ [key: string]: any }>()
      .then(({ data, error }) => {
        if (!error && data) {
          // cast to our ModelRow (we assume name is not null)
          setModel(data as ModelRow);
        }
      });

    // 2) subscribe to updates on this row
    const channel = supabase
      .channel(`public:models:id=eq.${modelId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "models",
          filter: `id=eq.${modelId}`,
        },
        (payload) => {
          setModel(payload.new as ModelRow);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [modelId, supabase]);

  if (!model) return null;

  return model.status === "finished" ? (
    <div className="flex flex-col w-full lg:w-1/2 rounded-md">
      <h1 className="text-xl">Results</h1>
      <div className="flex flex-row flex-wrap gap-4">
        {/* … your finished-model UI … */}
      </div>
    </div>
  ) : (
    <div>Training…</div>
  );
}
