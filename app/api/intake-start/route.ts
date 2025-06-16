import { NextResponse } from "next/server";

const ZAPIER_URL = process.env.ZAPIER_WEBHOOK_URL!;

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName } = await request.json();
    await fetch(ZAPIER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Failed to proxy to Zapier" }, { status: 500 });
  }
}
