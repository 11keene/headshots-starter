// app/auth/v1/callback/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (code) {
    // Exchange the OAuth code for a Supabase session cookie
    const res = NextResponse.next();
    const supabase = createRouteHandlerClient<Database>({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    // After setting the cookie, send them on
    return res;
  }

  // Fallback: no code? Just redirect to the dashboard
  return NextResponse.redirect(`${url.origin}/overview`);
}
