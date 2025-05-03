// File: app/api/ghlSync/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { event, user } = await req.json() as {
      event: string;
      user: { id: string; email?: string };
    };

    if (event === "user.created" && user.email) {
      const response = await fetch(
        "https://rest.gohighlevel.com/v1/contacts/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          },
          body: JSON.stringify({
            email: user.email,
            customFields: { supabase_id: user.id },
          }),
        }
      );

      if (!response.ok) {
        console.error("GHL sync failed:", await response.text());
      } else {
        console.log("✅ GHL contact created for", user.email);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error in /api/ghlSync:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
