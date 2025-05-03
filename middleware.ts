// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Database } from "./types/supabase";

// Only apply this middleware to non-API, non-_next, non-favicon routes
export const config = {
  matcher: [
    /*
      - Exclude anything under /api/
      - Exclude Next.js internals (_next/)
      - Exclude favicon.ico (and other root assets you might add)
    */
    "/((?!api/|_next/|favicon.ico).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Initialize Supabase client for edge auth checks
  const supabase = createMiddlewareClient<Database>({ req, res });
  await supabase.auth.getSession();

  return res;
}
