// app/api/send-ready-email-ghl/route.ts

const GHL_API_URL         = process.env.GHL_API_URL!;
const GHL_API_KEY         = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID     = process.env.GHL_LOCATION_ID!;
const GHL_WORKFLOW_ID     = process.env.GHL_PHOTOS_READY_WORKFLOW!;


import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse incoming JSON
    const body = await req.json();
    console.log("[send-ready-email-ghl] Received request:", body);

    const { userEmail, firstName, lastName, packId } = body;
    if (!userEmail || !packId) {
      return NextResponse.json(
        { error: "Missing required fields: userEmail or packId" },
        { status: 400 }
      );
    }

    // 2️⃣ Load environment variables
    const GHL_API_KEY = process.env.GHL_API_KEY;
    const LOCATION_ID = process.env.GHL_LOCATION_ID;

    if (!GHL_API_KEY || !LOCATION_ID) {
      console.error(
        "[send-ready-email-ghl] ❌ Missing env vars: GHL_API_KEY or GHL_LOCATION_ID"
      );
      return NextResponse.json(
        { error: "Server misconfiguration: missing env vars" },
        { status: 500 }
      );
    }

    // 3️⃣ Generate a unique timestamped tag for this contact update
const tags = [
      "photos_ready",                     // the static tag your workflow listens for
      `photos_ready_${Date.now()}`        // a brand-new tag every time (forces re‐enrollment)
    ];
    // 4️⃣ Build the upsert contact payload with custom fields and dynamic tag
const contactPayload = {
  email: userEmail,
  firstName,
  lastName,
  locationId: LOCATION_ID,
  customFields: {
    packid: packId,
    [process.env.GHL_STATUS_PAGE_FIELD!]: `https://www.aimavenstudio.com/status/${packId}`
  },
  tags,
};


    console.log("[send-ready-email-ghl] 🔍 Upserting contact with payload:");
    console.log(JSON.stringify(contactPayload, null, 2));

    // 5️⃣ Send POST to HighLevel’s /v1/contacts
    const upsertRes = await fetch("https://rest.gohighlevel.com/v1/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify(contactPayload),
    });

    const upsertJson = await upsertRes.json();
    if (!upsertRes.ok) {
      console.error(
        "[send-ready-email-ghl] ❌ Upsert failed:",
        JSON.stringify(upsertJson)
      );
      return NextResponse.json(
        { error: "Failed to create or update contact in GHL" },
        { status: 500 }
      );
    }

    const contactId = upsertJson.contact?.id;
    console.log(
      "[send-ready-email-ghl] ✅ Contact upserted. GHL contact ID =",
      contactId
    );
    console.log("[send-ready-email-ghl] 🏷️ Trigger tags used:", tags);
    // …right after you log "✅ Contact upserted. GHL contact ID = zR9CKilihXniXLWQ87rH"
// 👉 right before the trigger:
const workflowId = process.env.GHL_WORKFLOW_ID;      // e.g. 'bc7f7b63-6d76-4986-9b7c-923bff5ad037'
const locationId = process.env.GHL_LOCATION_ID;      // e.g. 'Shob7uPkCRfPCXvcZSV3'
const GHL_API_BASE = GHL_API_URL; // Use the env variable loaded at the top
// Option B: if GHL_API_URL already includes "/v1"
// ──────────────────────────────────────────────────────────────────────────────
// 4️⃣ Trigger the “photos_ready” workflow
// ──────────────────────────────────────────────────────────────────────────────
console.log(
  "[send-ready-email-ghl] 🚀 Triggering GHL workflow",
  GHL_WORKFLOW_ID,
  "for contact",
  contactId
);

// your base API URL should *not* repeat /v1; we'll add it here explicitly once
const triggerUrl = `${GHL_API_URL}/v1/locations/${GHL_LOCATION_ID}/workflows/${GHL_WORKFLOW_ID}/triggers`;
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
let triggerJson: any;
try {
  triggerJson = JSON.parse(raw);
} catch {
  triggerJson = raw;
}
console.log(
  `[send-ready-email-ghl] ← GHL response (${triggerRes.status}):`,
  triggerJson
);

if (!triggerRes.ok) {
  console.error(
    "[send-ready-email-ghl] ❌ Workflow trigger failed"
  );
  throw new Error(`GHL trigger failed with status ${triggerRes.status}`);
}


    // 6️⃣ Return success; GHL Automation will now trigger via dynamic tag
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-ready-email-ghl] ❌ Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
