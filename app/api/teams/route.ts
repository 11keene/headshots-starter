// File: app/api/teams/route.ts
// Handles creating and fetching the current user's team

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// POST = create new team
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name, size, company } = await req.json();

  const { data, error } = await supabase
    .from("teams")
    .insert({
      owner_id: user.id,
      team_name: name,
      team_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      team_size: size,
      company_name: company,
    })
    .select("id, team_name, team_id")
    .single();

  if (error) {
    console.error("Failed to create team:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// GET = fetch current user's team
export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("teams")
    .select("id, team_name, team_id")
    .eq("owner_id", user.id)
    .single();

  if (error) {
    console.error("Failed to fetch team:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(null, { status: 204 });
  }

  return NextResponse.json(data, { status: 200 });
}
