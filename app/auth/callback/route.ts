import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; 

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Optional: grab a `next` param if you want to redirect somewhere else
  const nextPath = url.searchParams.get("next") ?? "/overview";

  if (code) {
    // exchange the code for a session cookie
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // send the user on to your client portal
  return NextResponse.redirect(`${url.origin}/overview`);
}
