// File: app/api/start-astria/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    console.error("[start-astria] invalid JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, packs } = body as {
    userId?: string;
    packs?: { inputs: string[]; numOutputs: number }[];
  };

  console.log("[start-astria] received POST:", { userId, packs });
  if (!userId || !Array.isArray(packs) || packs.length === 0) {
    console.error("[start-astria] missing userId or packs");
    return NextResponse.json(
      { error: "Missing userId or packs" },
      { status: 400 }
    );
  }

  for (const { inputs, numOutputs } of packs) {
    console.log("[start-astria] calling Astria API with inputs:", inputs);
    const res = await fetch(`https://api.astria.ai/v1/generate`, {
      method: "POST",
      headers: { "x-api-key": process.env.ASTRIA_API_KEY! },
      body: JSON.stringify({
        modelId: process.env.ASTRIA_MODEL_ID,
        inputs,
        numOutputs,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `[start-astria] Astria API error ${res.status}:`,
        errText
      );
      continue;
    }

    let json: any;
    try {
      json = await res.json();
    } catch (e) {
      console.error("[start-astria] invalid JSON from Astria:", e);
      continue;
    }

    console.log("[start-astria] Astria success response:", json);
    const jobId = json.jobId || json.id || json.job_id;
    if (!jobId) {
      console.error("[start-astria] missing jobId in response");
      continue;
    }

    const { error } = await supabaseAdmin.from("astria_jobs").insert({
      user_id: userId,
      job_id: jobId,
      status: "pending",
      pack_prompt: JSON.stringify(inputs),
    });
    if (error) {
      console.error("[start-astria] insert error:", error);
    } else {
      console.log("[start-astria] inserted astria_job:", jobId);
    }
  }

  return NextResponse.json({ ok: true });
}