// components/realtime/ClientSideModelsList.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import ClientSideModel from "./ClientSideModel";
import ModelsTable, { modelRowWithSamples } from "../ModelsTable";

type ModelWithSamples = Database["public"]["Tables"]["models"]["Row"] & {
  samples: Database["public"]["Tables"]["samples"]["Row"][];
  name?: string; // Add 'name' property if it exists in your schema
  fine_tuned_face_id?: string; // Add 'fine_tuned_face_id' property if it exists in your schema
  pack?: string; // Add 'pack' property if it exists in your schema
  trained_at?: string; // Add 'trained_at' property if it exists in your schema
};

interface ClientSideModelsListProps {
  serverModels: ModelWithSamples[];
}

export default function ClientSideModelsList({
  serverModels,
}: ClientSideModelsListProps) {
  const [models, setModels] = useState<ModelWithSamples[]>(serverModels);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const channel = supabase
      .channel("realtime:models")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "models" },
        (payload: { new: ModelWithSamples }) => {
          setModels((current) => [...current, payload.new as ModelWithSamples]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="flex flex-col gap-4">
      {/* Real-time individual model previews */}
      {models.map((m) => (
        <ClientSideModel key={m.id.toString()} modelId={m.id.toString()} />
      ))}

      {/* Tabular overview of all models */}
      <div className="overflow-auto mt-8">
      <ModelsTable
  models={models.map((m): modelRowWithSamples => ({
    id:                 Number(m.id),                // number
    name:               m.name    ?? "",             // string
    pack:               m.pack    ?? "",             // string
    status:             m.status  ?? "",             // string
    fine_tuned_face_id: m.fine_tuned_face_id ?? "",  // string
    trained_at:         m.trained_at ?? "",         // string
    samples:            m.samples.map((s) => ({ uri: s.sample_images[0] })),  // { uri: string }[]
          }))}
        />
      </div>
    </div>
  );
}
