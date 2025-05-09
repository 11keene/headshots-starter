// File: app/api/astria/start-tune/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { ASTRIA_API_URL, ASTRIA_API_KEY, ASTRIA_TUNE_CALLBACK_URL } =
  process.env;

export async function POST(req: Request) {
  const { userId, packId, inputs } = (await req.json()) as {
    userId: string;
    packId: string;      // slug or numeric ID of your pack
    inputs: string[];    // array of public image URLs
  };

  if (!userId || !packId || inputs.length === 0) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  // 1) call Astria to create a new tune for that pack
  const tuneRes = await fetch(`${ASTRIA_API_URL}/p/${packId}/tunes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ASTRIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tune: {
        title: `headshot-${userId}-${packId}-${Date.now()}`,
        name: packId,
        callback: ASTRIA_TUNE_CALLBACK_URL,
        image_urls: inputs,
      },
    }),
  });

  if (!tuneRes.ok) {
    const text = await tuneRes.text();
    console.error("Pack→tune failed:", text);
    return NextResponse.json({ error: "Pack→tune failed", details: text }, { status: 502 });
  }

  const { id: tuneId } = await tuneRes.json();

  // 2) store in your own DB
  await supabaseAdmin.from("astria_tunes").insert({
    user_id: userId,
    pack_id: packId,
    tune_id: tuneId,
    status: "pending",
  });

  return NextResponse.json({ tuneId });
}
