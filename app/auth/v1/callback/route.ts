// app/auth/v1/callback/route.ts
import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { isAuthApiError }  from "@supabase/supabase-js";
import { cookies }         from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const nextPath = url.searchParams.get("next") || "/overview";

  if (error) {
    console.error("OAuth error:", { error, description: url.searchParams.get("error_description") });
    return NextResponse.redirect(`${url.origin}/login/failed?err=${error}`);
  }

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    try {
      await supabase.auth.exchangeCodeForSession(code);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
    } catch (e) {
      console.error("Exchange failed:", e);
      return NextResponse.redirect(`${url.origin}/login/failed?err=exchange`);
    }
  }

  // now that the cookie is set, send them on their way:
  return NextResponse.redirect(new URL(nextPath, url.origin));
}
