// File: app/api/astria-mapping/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { astriaPromptId, packId } = (await req.json()) as {
    astriaPromptId?: string;
    packId?: string;
  };
  if (!astriaPromptId || !packId) {
    return NextResponse.json(
      { error: "Missing astriaPromptId or packId" },
      { status: 400 }
    );
  }
  const supabase = createRouteHandlerClient({ cookies });
  const { error } = await supabase.from("astria_mappings").insert([
    {
      astria_prompt: astriaPromptId,
      pack_id: packId,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("[astria-mapping] Insert error:", error);
    return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
