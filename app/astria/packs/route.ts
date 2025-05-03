// File: app/astria/packs/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

// Force this route to be dynamic so we can read env vars & cookies per request
export const dynamic = "force-dynamic";

// Environment Variables
const API_KEY = process.env.ASTRIA_API_KEY;
const QUERY_TYPE = process.env.PACK_QUERY_TYPE || "users"; // "users", "gallery", or "both"
const DOMAIN = "https://api.astria.ai";

// Fail fast if we forgot to set the key
if (!API_KEY) {
  throw new Error("MISSING ASTRIA_API_KEY in environment");
}

export async function GET(request: Request) {
  // 1️⃣ Initialize Supabase server client with incoming cookies
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // 2️⃣ Verify the user is logged in
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 3️⃣ Build authorization header for Astria
    const headers = { Authorization: `Bearer ${API_KEY}` };

    // 4️⃣ Determine which pack endpoints to call
    const endpoints: string[] = [];
    if (QUERY_TYPE === "users" || QUERY_TYPE === "both") {
      endpoints.push(`${DOMAIN}/packs`);
    }
    if (QUERY_TYPE === "gallery" || QUERY_TYPE === "both") {
      endpoints.push(`${DOMAIN}/gallery/packs`);
    }

    // 5️⃣ Fetch them all in parallel
    const responses = await Promise.all(
      endpoints.map((url) => axios.get(url, { headers }))
    );

    // 6️⃣ Combine the arrays returned by each endpoint
    const combinedData = responses.flatMap((resp) => resp.data);

    // 7️⃣ Return to the client
    return NextResponse.json(combinedData);
  } catch (error) {
    console.error("Error fetching Astria packs:", error);
    return NextResponse.json(
      { message: "Failed to fetch packs." },
      { status: 500 }
    );
  }
}
