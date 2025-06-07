// File: app/api/astria/start-custom-tune/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { ASTRIA_API_URL, ASTRIA_API_KEY, ASTRIA_TUNE_CALLBACK_URL } = process.env;

export async function POST(req: Request) {
  const { userId, promptUrlList, preset } = await req.json();
  // `promptUrlList` = user’s URLs; `preset` = “flux-lora-portrait”ss
  const tuneRes = await fetch(`${ASTRIA_API_URL}/tunes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ASTRIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tune: {
        title: `custom-${userId}-${Date.now()}`,
        callback: ASTRIA_TUNE_CALLBACK_URL,
        input_urls: promptUrlList,
        preset, 
      },
    }),
  });
  // ... same insert as above
}
