// File: app/api/send-ready-email-ghl/route.ts

import { NextResponse } from "next/server";

const GHL_API_URL     = process.env.GHL_API_URL!;         // e.g. "https://rest.gohighlevel.com"
const GHL_API_KEY     = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse + validate
    const { userEmail, firstName, lastName, packId } = await req.json();
    console.log("[send-ready-email-ghl] Received request:", { userEmail, firstName, lastName, packId });
    if (!userEmail || !packId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2️⃣ Build tags + payload
    const tags = ["photos_ready", `photos_ready_${Date.now()}`];
    const contactPayload = {
      email: userEmail,
      firstName,
      lastName,
      locationId: GHL_LOCATION_ID,
      customFields: {
        packid: packId,
        [process.env.GHL_STATUS_PAGE_FIELD!]: `https://www.aimavenstudio.com/status/${packId}`
      },
      tags,
    };
    console.log("[send-ready-email-ghl] 🔍 Upserting contact:", contactPayload);

    // 3️⃣ Upsert contact
    const upsertRes  = await fetch(`${GHL_API_URL}/v1/contacts`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify(contactPayload),
    });
    const upsertJson = await upsertRes.json();
    console.log(`[send-ready-email-ghl] ← Upsert response (${upsertRes.status}):`, upsertJson);
    if (!upsertRes.ok) {
      console.error("[send-ready-email-ghl] ❌ Upsert failed");
      return NextResponse.json({ error: "Failed to upsert contact in GHL" }, { status: 500 });
    }

    // 4️⃣ Done
    const contactId = upsertJson.contact?.id;
    console.log("[send-ready-email-ghl] ✅ Contact upserted. contactId =", contactId);
    return NextResponse.json({ success: true, contactId });
  } catch (err: any) {
    console.error("[send-ready-email-ghl] ❌ Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
