// app/auth/v1/callback/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // Prepare the response so we can set cookies
  const res = NextResponse.next();

  if (code) {
    // Exchange the OAuth authorization code for a Supabase session cookie
    const supabase = createRouteHandlerClient<Database>({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Now that the cookie is set, redirect to the dashboard
  return NextResponse.redirect(`${url.origin}/overview`);
}
