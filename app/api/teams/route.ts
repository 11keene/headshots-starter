// File: app/api/teams/route.ts
// Handles creating a new team and fetching the current user's team

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Create a new team
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { name, size, department, useCase, phone, website } = body;

  const { data, error } = await supabase
    .from("teams")
    .insert({
      owner_id:   user.id,
      team_name:  name,
      team_size:  size,
      department,
      use_case:   useCase,
      phone,
      website,
    })
    .select("id,team_name,team_size,department,use_case,phone,website")
    .single();

  if (error) {
    console.error("Failed to create team:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}

// Fetch the current user's team
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
    .select("id,team_name,team_size,department,use_case,phone,website")
    .eq("owner_id", user.id)
    .single();

  if (error) {
    console.error("Failed to fetch team:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(null, { status: 204 });
  }

  return NextResponse.json(data, { status: 200 });
}
