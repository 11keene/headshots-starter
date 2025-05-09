// File: app/api/astria/tune-callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.tune?.id) {
    console.error("Invalid callback payload:", body);
    return NextResponse.json({}, { status: 400 });
  }

  const tuneId = body.tune.id as string;
  const newState = body.tune.state as string; 
  console.log("[tune-callback] tuneId:", tuneId, "state:", newState);

  // Update our record
  const { error } = await supabaseAdmin
    .from("astria_tunes")
    .update({ status: newState, updated_at: new Date().toISOString() })
    .eq("tune_id", tuneId);

  if (error) {
    console.error("Failed to update tune status:", error);
    return NextResponse.json({}, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
