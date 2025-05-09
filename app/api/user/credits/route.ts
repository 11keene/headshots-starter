// app/api/user/credits/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use your service-role key so this can read any user
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Read the user ID from a custom header
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ credits: 0 });
  }

  // Query Supabase for that user’s credits
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching credits:", error);
  }

  return NextResponse.json({ credits: data?.credits ?? 0 });
}
