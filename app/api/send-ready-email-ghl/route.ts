// app/api/send-ready-email-ghl/route.ts

import { NextResponse } from "next/server";

const GHL_API_URL     = process.env.GHL_API_URL!;               // e.g. "https://rest.gohighlevel.com"
const GHL_API_KEY     = process.env.GHL_API_KEY!;               // your HighLevel REST API key
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;           // e.g. "Shob7uPkCRfPCXvcZSV3"
const GHL_WORKFLOW_ID = process.env.GHL_PHOTOS_READY_WORKFLOW!; // e.g. "bc7f7b63-6d76-4986-9b7c-923bff5ad037"

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse & validate
    const { userEmail, firstName, lastName, packId } = await req.json();
    console.log("[send-ready-email-ghl] Received request:", { userEmail, firstName, lastName, packId });
    if (!userEmail || !packId) {
      return NextResponse.json({ error: "Missing required fields: userEmail or packId" }, { status: 400 });
    }

    // 2️⃣ Build upsert payload
    const tags = ["photos_ready", `photos_ready_${Date.now()}`];
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
    console.log("[send-ready-email-ghl] 🔍 Upserting contact:", JSON.stringify(contactPayload, null, 2));

    // 3️⃣ Create or update contact (global endpoint)
    const upsertUrl  = `${GHL_API_URL}/v1/contacts`;
    console.log("[send-ready-email-ghl] ⏳ Upsert URL:", upsertUrl);
    console.log("[send-ready-email-ghl] ⏳ Upsert payload:", JSON.stringify(contactPayload));
const upsertRes  = await fetch(`${GHL_API_URL}/v1/contacts`, {
        method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify(contactPayload),
    });
const upsertRaw  = await upsertRes.text();
    let    upsertJson: any = upsertRaw;
    try { upsertJson = JSON.parse(upsertRaw); } catch {}
    console.log(`[send-ready-email-ghl] ← Upsert response (${upsertRes.status}):`, upsertJson);    if (!upsertRes.ok) {
      console.error("[send-ready-email-ghl] ❌ Upsert failed:", upsertJson);
      return NextResponse.json({ error: "Failed to create or update contact in GHL" }, { status: 500 });
    }

    const contactId = upsertJson.contact?.id;
    console.log("[send-ready-email-ghl] ✅ Contact upserted. GHL contact ID =", contactId);
    console.log("[send-ready-email-ghl] 🏷️ Tags used:", tags);

    // 4️⃣ Trigger the “photos_ready” workflow
    const triggerUrl = `${GHL_API_URL}/v1/locations/${GHL_LOCATION_ID}/workflows/${GHL_WORKFLOW_ID}/triggers`;
console.log("[send-ready-email-ghl] 🚀 Triggering workflow at:", triggerUrl);   
 console.log("  URL:   ", triggerUrl);
    console.log("  Body:  ", { contactId });

    const triggerRes = await fetch(triggerUrl, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify({ contactId }),
    });
    const raw = await triggerRes.text();
    let triggerJson: any = raw;
    try { triggerJson = JSON.parse(raw); } catch {}
 console.log(`[send-ready-email-ghl] ← Trigger response (${triggerRes.status}):`, triggerJson);
 
    if (!triggerRes.ok) {
      console.error("[send-ready-email-ghl] ❌ Workflow trigger failed");
      return NextResponse.json({ error: "Workflow trigger failed" }, { status: 500 });
    }

    // 5️⃣ All done
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-ready-email-ghl] ❌ Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
