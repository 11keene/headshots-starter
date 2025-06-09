import { NextResponse } from "next/server";

const GHL_API_URL     = process.env.GHL_API_URL!;               // e.g. "https://api.gohighlevel.com"
const GHL_API_KEY     = process.env.GHL_API_KEY!;               // your HighLevel REST API key
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;           // e.g. "Shob7uPkCRfPCXvcZSV3"
const GHL_WORKFLOW_ID = process.env.GHL_PHOTOS_READY_WORKFLOW!; // this was coming back undefined

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse incoming JSON
    const { userEmail, firstName, lastName, packId } = await req.json();
    console.log("[send-ready-email-ghl] Received request:", { userEmail, firstName, lastName, packId });
    if (!userEmail || !packId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2️⃣ Build payload with two tags
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

    console.log("[send-ready-email-ghl] 🔍 Upserting contact with payload:", contactPayload);

    // 3️⃣ Upsert contact
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
      return NextResponse.json({ error: "Upsert failed" }, { status: 500 });
    }

    const contactId = upsertJson.contact?.id;
    console.log("[send-ready-email-ghl] ✅ Contact upserted. ID =", contactId);
    console.log("[send-ready-email-ghl] 🏷️ Tags used:", tags);

    // 4️⃣ Trigger the workflow (this is where workflowId was undefined)
    const triggerUrl = `${GHL_API_URL}/v1/locations/${GHL_LOCATION_ID}/workflows/${GHL_WORKFLOW_ID}/triggers`;
    console.log("[send-ready-email-ghl] 🚀 Triggering workflow:", triggerUrl, { contactId });

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
    console.log(`[send-ready-email-ghl] ← GHL response (${triggerRes.status}):`, triggerJson);

    if (!triggerRes.ok) {
      console.error("[send-ready-email-ghl] ❌ Workflow trigger failed");
      return NextResponse.json({ error: "Trigger failed" }, { status: 500 });
    }

    // 5️⃣ Done
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("[send-ready-email-ghl] ❌ Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
