// File: app/api/astria/train‐tune/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const ASTRIA_API_URL = "https://api.astria.ai";
const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!;

export async function POST(req: Request) {
  const { userId, packType, trainingData } = (await req.json()) as {
    userId: string;
    packType: string;
    trainingData: string[]; // whatever your train endpoint needs
  };

  // 1) kick off Astria train
  const astriaRes = await fetch(`${ASTRIA_API_URL}/train`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ASTRIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, packType, trainingData }),
  });
  if (!astriaRes.ok) {
    const errText = await astriaRes.text();
    console.error("Astria train failed:", errText);
    return NextResponse.error();
  }
  const { tune_id: tuneId } = await astriaRes.json();

  // 2) **UPERT your new tune_id into your tunes table**
  const { error } = await supabaseAdmin
    .from("tunes")
    .upsert({
      user_id:   userId,
      pack_type: packType,
      tune_id:   tuneId,
    });
  if (error) {
    console.error("Supabase upsert tune failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3) return the new tuneId
  return NextResponse.json({ tuneId });
}
