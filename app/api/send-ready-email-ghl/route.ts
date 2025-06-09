// app/api/send-ready-email-ghl/route.ts

import { NextResponse } from "next/server";

const GHL_API_URL            = process.env.GHL_API_URL!;                 // e.g. "https://rest.gohighlevel.com"
const GHL_API_KEY            = process.env.GHL_API_KEY!;                 // your HighLevel REST API key
const GHL_LOCATION_ID        = process.env.GHL_LOCATION_ID!;             // e.g. "Shob7uPkCRfPCXvcZSV3"
const GHL_WORKFLOW_ID        = process.env.GHL_PHOTOS_READY_WORKFLOW!;   // e.g. "bc7f7b63-6d76-4986-9b7c-923bff5ad037"
const GHL_STATUS_PAGE_FIELD  = process.env.GHL_STATUS_PAGE_FIELD!;       // e.g. "statuspagelink"

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse & validate
    const { userEmail, firstName, lastName, packId } = await req.json();
    console.log("[send-ready-email-ghl] Received request:", { userEmail, firstName, lastName, packId });
    if (!userEmail || !packId) {
      return NextResponse.json({ error: "Missing required fields: userEmail or packId" }, { status: 400 });
    }

    // 2️⃣ Build contact upsert payload
    const tags = [
      "photos_ready",                   // static trigger tag
      `photos_ready_${Date.now()}`      // unique timestamped tag
    ];

    const contactPayload = {
      email:        userEmail,
      firstName,
      lastName,
      locationId:   GHL_LOCATION_ID,
      customFields: {
        packid:           packId,
        [GHL_STATUS_PAGE_FIELD]: `https://www.aimavenstudio.com/status/${packId}`,
      },
      tags,
    };

    console.log("[send-ready-email-ghl] 🔍 Upserting contact with payload:");
    console.log(JSON.stringify(contactPayload, null, 2));

    // 3️⃣ Upsert contact
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

    // 4️⃣ Trigger the “photos_ready” workflow
    const triggerUrl = `${GHL_API_URL}/v1/workflows/trigger`;
    console.log(
      "[send-ready-email-ghl] 🚀 Triggering GHL workflow",
      GHL_WORKFLOW_ID,
      "for contact",
      contactId
    );
    console.log("  URL:  ", triggerUrl);
    console.log("  Body: ", { workflowId: GHL_WORKFLOW_ID, contactId });

    try {
      const triggerRes = await fetch(triggerUrl, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${GHL_API_KEY}`,
        },
        body: JSON.stringify({ workflowId: GHL_WORKFLOW_ID, contactId }),
      });
      const raw = await triggerRes.text();
      let triggerJson: any = raw;
      try { triggerJson = JSON.parse(raw); } catch {}
      console.log(`[send-ready-email-ghl] ← GHL response (${triggerRes.status}):`, triggerJson);

      if (!triggerRes.ok) {
        throw new Error(`GHL trigger failed with status ${triggerRes.status}`);
      }
    } catch (err) {
      console.error("[send-ready-email-ghl] ❌ Workflow trigger failed:", err);
    }

    // 5️⃣ Done
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-ready-email-ghl] ❌ Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
