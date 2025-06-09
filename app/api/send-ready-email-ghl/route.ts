// app/api/send-ready-email-ghl/route.ts
import { NextResponse } from "next/server";

const GHL_API_URL     = process.env.GHL_API_URL!;               // e.g. "https://rest.gohighlevel.com"
const GHL_API_KEY     = process.env.GHL_API_KEY!;               // your HighLevel REST API key
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;           // e.g. "Shob7uPkCRfPCXvcZSV3"

export async function POST(req: Request) {
  try {
    const { userEmail, firstName, lastName, packId } = await req.json();
    console.log("[send-ready-email-ghl] Received request:", { userEmail, firstName, lastName, packId });
    if (!userEmail || !packId) {
      return NextResponse.json({ error: "Missing userEmail or packId" }, { status: 400 });
    }

    const tags = ["photos_ready", `photos_ready_${Date.now()}`];
    const contactPayload = {
      email:        userEmail,
      firstName,
      lastName,
      locationId:   GHL_LOCATION_ID,
      customFields: {
        packid: packId,
        [process.env.GHL_STATUS_PAGE_FIELD!]: `https://www.aimavenstudio.com/status/${packId}`
      },
      tags,
    };

    console.log("[send-ready-email-ghl] 🔍 Upserting contact:", contactPayload);
    const upsertRes = await fetch(`${GHL_API_URL}/v1/contacts`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify(contactPayload),
    });

    const upsertJson = await upsertRes.json();
    if (!upsertRes.ok) {
      console.error("[send-ready-email-ghl] ❌ Upsert failed:", upsertJson);
      return NextResponse.json({ error: "Contact upsert failed" }, { status: 500 });
    }

    console.log("[send-ready-email-ghl] ✅ Contact upserted. ID =", upsertJson.contact.id);
    return NextResponse.json({ contactId: upsertJson.contact.id });
  } catch (err: any) {
    console.error("[send-ready-email-ghl] ❌ Unexpected:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
