// app/api/teams/invite/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { emails, teamId } = await req.json();
  const WEBHOOK = process.env.GHL_TEAM_INVITE_WEBHOOK_URL!;
  if (!WEBHOOK) {
    console.error("No GHL_TEAM_INVITE_WEBHOOK_URL set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    // Send one webhook per email address
    await Promise.all(
      emails.map((email: string) =>
        fetch(WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, teamId }),
        })
      )
    );
    return NextResponse.json({ message: "Invites queued" });
  } catch (err) {
    console.error("Failed to call Team Invite webhook:", err);
    return NextResponse.json({ error: "Invite failed" }, { status: 500 });
  }
}
