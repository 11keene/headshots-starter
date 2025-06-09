// File: app/api/ghl/workflow-callback/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("[GHL Callback] payload:", payload);

    const { contactId, email, firstName, lastName, packid: packId } = payload;
    if (!email || !packId) {
      console.error("[GHL Callback] Missing email or packId:", payload);
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Re-use your send-ready handler
    const siteUrl = process.env.SITE_URL!;
    const res     = await fetch(`${siteUrl}/api/send-ready-email-ghl`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userEmail: email, firstName, lastName, packId }),
    });
    const result  = await res.json();
    console.log("[GHL Callback] send-ready-email-ghl response:", result);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[GHL Callback] ❌ Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
