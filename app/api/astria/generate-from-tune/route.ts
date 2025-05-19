// File: app/api/astria/generate-from-tune/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// — Initialize Supabase Admin client —
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// — Astria config from env —
const ASTRIA_API_URL = "https://api.astria.ai";
const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!;

export async function POST(request: Request) {
  try {
    const { userId, tuneId, inputs, numOutputs } = (await request.json()) as {
      userId: string;
      tuneId: string;
      inputs: string[];
      numOutputs?: number;
    };

    if (!tuneId || !Array.isArray(inputs) || inputs.length === 0) {
      return NextResponse.json(
        { error: "Missing tuneId or inputs" },
        { status: 400 }
      );
    }

    // 1) Call Astria's tune→generate endpoint
    const res = await fetch(
      `${ASTRIA_API_URL}/tunes/${tuneId}/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ASTRIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs,
          numOutputs: numOutputs ?? inputs.length,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("📛 Tune→generate failed:", text);
      return NextResponse.json(
        { error: "Astria generate failed", details: text },
        { status: 502 }
      );
    }

    const payload = await res.json();

    // 2) Record each job in your DB (optional)
    if (Array.isArray(payload.jobId ? [payload.jobId] : payload.jobIds)) {
      const jobIds = payload.jobIds ?? [payload.jobId];
      await Promise.all(
        jobIds.map((jobId: string) =>
          supabaseAdmin.from("astria_jobs").insert({
            user_id: userId,
            tune_id: tuneId,
            job_id: jobId,
            status: "pending",
            pack_prompt: null,
          })
        )
      );
    }

    // 3) Return Astria's response back to the client
    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("❌ generate-from-tune error:", err);
    return NextResponse.json(
      { error: "Internal server error during generation" },
      { status: 500 }
    );
  }
}
