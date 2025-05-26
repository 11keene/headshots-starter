// app/api/ghlSync/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Optional: verify a secret header
  // const secret = request.headers.get("x-webhook-secret");
  // if (secret !== process.env.WEBHOOK_SECRET) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const { GHL_API_KEY, GHL_API_URL, GHL_ACCOUNT_ID } = process.env;
  if (!GHL_API_KEY || !GHL_API_URL || !GHL_ACCOUNT_ID) {
    return NextResponse.json(
      { error: "Missing GHL_API_KEY, GHL_API_URL or GHL_ACCOUNT_ID" },
      { status: 500 }
    );
  }

  const { event, user } = await request.json() as {
    event: string;
    user: { id: string; email?: string };
  };

  if (event === "user.created" && user.email) {
    const url = `${GHL_API_URL}/v1/accounts/${GHL_ACCOUNT_ID}/contacts`;
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          customFields: { supabase_id: user.id },
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("GHL sync failed:", text);
        // optionally return an error status:
        // return NextResponse.json({ error: text }, { status: resp.status });
      } else {
        console.log("✅ GHL contact created for", user.email);
      }
    } catch (err: any) {
      console.error("Error syncing to GHL:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

// If you want to reject other methods explicitly:
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
