// app/api/teams/join/[token]/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  // Look up the invite:
  const { data: inv, error: e1 } = await supabase
    .from("team_invites")
    .select("id, team_id, status")
    .eq("token", params.token)
    .single();
  if (e1 || !inv || inv.status !== "pending") {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  // Mark invite accepted + add to members
  const { error: e2 } = await supabase
    .from("team_invites")
    .update({ status: "accepted" })
    .eq("id", inv.id);
  const { error: e3 } = await supabase
    .from("team_members")
    .insert({ team_id: inv.team_id, user_id: user.id, invite_id: inv.id });

  if (e2 || e3) {
    return NextResponse.json({ error: "Join failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
