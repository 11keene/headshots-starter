// components/realtime/ClientSideModel.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

type ModelRow = Database["public"]["Tables"]["models"]["Row"];

interface ClientSideModelProps {
  modelId: string;
}

export default function ClientSideModel({ modelId }: ClientSideModelProps) {
  const supabase = createClientComponentClient<Database>();
  const [model, setModel] = useState<ModelRow | null>(null);

  useEffect(() => {
    // Fetch the model by its string ID
    supabase
      .from("models")
      .select("*")
      .eq("id", modelId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching model:", error);
        } else {
          setModel(data);
        }
      });
  }, [supabase, modelId]);

  if (!model) {
    return <div>Loading model...</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold">{model.id}</h3>
      {/* <p className="text-sm">Pack: {model.pack}</p> */}
      <p className="text-sm">Status: {model.status}</p>
      {/* Add more model fields here as needed */}
    </div>
  );
}
