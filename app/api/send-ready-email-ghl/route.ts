// app/api/send-ready-email-ghl/route.ts

import { NextResponse } from "next/server";

const GHL_API_URL           = process.env.GHL_API_URL!;               // e.g. "https://api.gohighlevel.com"
const GHL_API_KEY           = process.env.GHL_API_KEY!;               // your HighLevel API Key
const GHL_LOCATION_ID       = process.env.GHL_LOCATION_ID!;           // e.g. "Shob7uPkCRfPCXvcZSV3"
const GHL_WORKFLOW_ID       = process.env.GHL_PHOTOS_READY_WORKFLOW!; // e.g. "bc7f7b63-6d76-4986-9b7c-923bff5ad037"

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse incoming JSON
    const { userEmail, firstName, lastName, packId } = await req.json();
    console.log("[send-ready-email-ghl] Received request:", { userEmail, firstName, lastName, packId });
    if (!userEmail || !packId) {
      return NextResponse.json({ error: "Missing required fields: userEmail or packId" }, { status: 400 });
    }

    // 2️⃣ Build upsert payload (incl. two tags: static + timestamped)
    const tags = [
      "photos_ready",
      `photos_ready_${Date.now()}`
    ];
    const contactPayload = {
      email:        userEmail,
      firstName,
      lastName,
      locationId:   GHL_LOCATION_ID,
      customFields: {
        packid:         packId,
        statuspagelink: `https://www.aimavenstudio.com/status/${packId}`,
      },
      tags,
    };

    console.log("[send-ready-email-ghl] 🔍 Upserting contact with payload:");
    console.log(JSON.stringify(contactPayload, null, 2));

    // 3️⃣ Upsert contact in HighLevel
    const upsertRes  = await fetch(`${GHL_API_URL}/v1/contacts`, {
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
      return NextResponse.json({ error: "Failed to create or update contact in GHL" }, { status: 500 });
    }

    const contactId = upsertJson.contact?.id;
    console.log("[send-ready-email-ghl] ✅ Contact upserted. GHL contact ID =", contactId);
    console.log("[send-ready-email-ghl] 🏷️ Trigger tags used:", tags);

    // 4️⃣ Trigger the photos-ready workflow
    const triggerUrl = `${GHL_API_URL}/v1/locations/${GHL_LOCATION_ID}/workflows/${GHL_WORKFLOW_ID}/triggers`;
    console.log("[send-ready-email-ghl] 🚀 Triggering workflow:");
    console.log("  URL:    ", triggerUrl);
    console.log("  Payload:", { contactId });

    let raw: string, triggerJson: any;
    const triggerRes = await fetch(triggerUrl, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify({ contactId }),
    });
    raw = await triggerRes.text();
    try {
      triggerJson = JSON.parse(raw);
    } catch {
      triggerJson = raw;
    }
    console.log(`[send-ready-email-ghl] ← GHL response (${triggerRes.status}):`, triggerJson);
    if (!triggerRes.ok) {
      console.error("[send-ready-email-ghl] ❌ Workflow trigger failed");
      return NextResponse.json({ error: "Workflow trigger failed" }, { status: 500 });
    }

    // 5️⃣ Everything succeeded
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-ready-email-ghl] ❌ Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
