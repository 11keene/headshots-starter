import { NextResponse } from "next/server";

const GHL_API_URL     = process.env.GHL_API_URL!;       // NO /v1 suffix here
const GHL_API_KEY     = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;
const GHL_WORKFLOW_ID = process.env.GHL_PHOTOS_READY_WORKFLOW!;

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse and validate
    const body = await req.json();
    console.log("[send-ready-email-ghl] Received body:", body);
    const { userEmail, firstName = "", lastName = "", packId } = body;
    if (!userEmail || !packId) {
      console.error("[send-ready-email-ghl] Missing userEmail or packId");
      return NextResponse.json(
        { error: "Missing userEmail or packId" },
        { status: 400 }
      );
    }

    // 2️⃣ Build payload
    const tags = ["photos_ready", `photos_ready_${Date.now()}`];
    const contactPayload = {
      email: userEmail,
      firstName,
      lastName,
      locationId: GHL_LOCATION_ID,
      customFields: {
        packid: packId,
        statuspagelink: `https://www.aimavenstudio.com/status/${packId}`,
      },
      tags,
    };
  console.log("[send-ready-email-ghl] ⏳ Upsert URL:", `${GHL_API_URL}/v1/contacts`);
  const upsertRes = await fetch(`${GHL_API_URL}/v1/contacts`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GHL_API_KEY}`,
    },
    body: JSON.stringify(contactPayload),
  });

    const upsertText = await upsertRes.text();
    let upsertJson: any;
    try { upsertJson = JSON.parse(upsertText); } catch { upsertJson = upsertText; }
    console.log(
      `[send-ready-email-ghl] Upsert response (${upsertRes.status}):`,
      upsertJson
    );

    if (!upsertRes.ok) {
      console.error("[send-ready-email-ghl] ❌ Upsert failed");
      return NextResponse.json(
        { error: "Contact upsert failed", details: upsertJson },
        { status: upsertRes.status }
      );
    }

    const contactId = upsertJson.contact?.id;
    console.log("[send-ready-email-ghl] ✅ Contact upserted ID:", contactId);

    // 4️⃣ Return contactId for next step
    return NextResponse.json({ contactId });
  } catch (err: any) {
    console.error("[send-ready-email-ghl] ❌ Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
