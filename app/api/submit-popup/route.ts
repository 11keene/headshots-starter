// File: app/api/submit-popup/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { firstName, email } = await req.json();

    const zapierWebhookUrl = "https://hooks.zapier.com/hooks/catch/21354233/uomxwm6/";

    const zapierRes = await fetch(zapierWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, email }), // 👈 match this to your Zap fields
    });

    if (!zapierRes.ok) {
      throw new Error(`Zapier webhook failed with status ${zapierRes.status}`);
    }

    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error("❌ Server error in /submit-popup:", err);
    return NextResponse.json({ status: "error", error: String(err) }, { status: 500 });
  }
}
