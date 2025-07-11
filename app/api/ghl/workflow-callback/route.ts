import { NextResponse } from "next/server";

const GHL_API_URL         = process.env.GHL_API_URL!;
const GHL_API_KEY         = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID     = process.env.GHL_LOCATION_ID!;
const GHL_WORKFLOW_ID     = process.env.GHL_PHOTOS_READY_WORKFLOW!;

export async function POST(req: Request) {
  try {
    const { contactId } = await req.json();
    console.log("[workflow-callback] Received contactId:", contactId);
    if (!contactId) {
      return NextResponse.json({ error: "contactId required" }, { status: 400 });
    }

    const triggerUrl = `${GHL_API_URL}/v1/locations/${GHL_LOCATION_ID}/workflows/${GHL_WORKFLOW_ID}/triggers`;
    console.log("[workflow-callback] 🚀 Triggering workflow at", triggerUrl);
    console.log("  body:", { contactId });

    const triggerRes = await fetch(triggerUrl, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify({ contactId }),
    });
    const triggerJson = await triggerRes.json();
    console.log(`[workflow-callback] ← Response (${triggerRes.status}):`, triggerJson);

    if (!triggerRes.ok) {
      console.error("[workflow-callback] ❌ Trigger failed");
      return NextResponse.json({ error: "Workflow trigger failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[workflow-callback] ❌ Unexpected:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
