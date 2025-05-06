// app/api/purchase/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Initialize Supabase client with cookies for auth
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Verify user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Parse request body
  const { packId, sessionId } = (await request.json()) as {
    packId: string;
    sessionId: string;
  };

  // Insert order and let DB trigger allocate credits
  type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
  const { error } = await supabase
    .from("orders")
    .insert([
      {
        user_id: session.user.id,
        pack: packId,
        session_id: sessionId,
        status: "complete",
      } as OrderInsert,
    ]);

  if (error) {
    console.error("Failed to insert order:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
