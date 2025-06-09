// app/api/ghl/create-contact.ts
import type { NextApiRequest, NextApiResponse } from "next";

const GHL_API_URL         = process.env.GHL_API_URL!;
const GHL_API_KEY         = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID     = process.env.GHL_LOCATION_ID!;
const GHL_WORKFLOW_ID = process.env.GHL_PHOTOS_READY_WORKFLOW!; // e.g. "bc7f7b63-6d76-4986-9b7c-923bff5ad037"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, firstName, lastName } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing required field: email" });
  }

  try {
    // 1️⃣ Upsert contact
    const upsertRes = await fetch(`${GHL_API_URL}/v1/contacts`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    const upsertRaw = await upsertRes.text();
    let upsertJson: any;
    try { upsertJson = JSON.parse(upsertRaw); } catch { upsertJson = upsertRaw; }
    console.log("[create-contact] ← /contacts response:", upsertRes.status, upsertJson);

    if (!upsertRes.ok) {
      return res.status(upsertRes.status).json({ error: upsertJson });
    }

    const contactId = upsertJson.contact?.id || upsertJson.id;
    if (!contactId) {
      console.warn("[create-contact] ⚠️ No contact ID returned:", upsertJson);
      return res.status(500).json({ error: "GHL did not return a contact ID" });
    }

    // 2️⃣ Trigger welcome workflow
 // 4️⃣ Trigger the “photos_ready” workflow via the global trigger endpoint
  const triggerUrl = `${GHL_API_URL}/v1/workflows/trigger`;    
  console.log("[create-contact] 🚀 Triggering welcome workflow:", triggerUrl, { contactId });
console.log("  URL:   ", triggerUrl);
  console.log("  Body:  ", {
    workflowId: GHL_WORKFLOW_ID,
    contactId,
  });
      const triggerRes = await fetch(triggerUrl, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GHL_API_KEY}`,
    },
    body: JSON.stringify({
      workflowId: GHL_WORKFLOW_ID,
     contactId,
    }),
  });
    
    const triggerRaw = await triggerRes.text();
    let triggerJson: any;
    try { triggerJson = JSON.parse(triggerRaw); } catch { triggerJson = triggerRaw; }
    console.log("[create-contact] ← /workflows trigger response:", triggerRes.status, triggerJson);

    if (!triggerRes.ok) {
      console.error("[create-contact] ❌ Workflow trigger failed:", triggerJson);
      // but we still return the contact upsert success
    }

    // 3️⃣ Return
    return res.status(200).json({
      contact: upsertJson,
      workflowTrigger: {
        status: triggerRes.status,
        response: triggerJson,
      },
    });
  } catch (err: any) {
    console.error("[create-contact] ❌ Unexpected error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
