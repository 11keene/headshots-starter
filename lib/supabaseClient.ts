// lib/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client (uses Service Role key)
 * This client should only be used in server-side code (e.g. API routes, scripts)s
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
