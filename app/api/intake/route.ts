// File: app/api/intake/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId, intake } = await req.json();
  if (!userId || !intake) {
    return NextResponse.json({ error: "userId and intake required" }, { status: 400 });
  }

  // Upsert into a dedicated "intakes" table
  await supabaseAdmin
    .from("intakes")
    .upsert(
      { user_id: userId, pack_slug: "defaultPack", answers: intake },
      { onConflict: "user_id,pack_slug" }
    );

  return NextResponse.json({ success: true });
}
