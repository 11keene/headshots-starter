// app/api/workflow-callback/route.ts
import { NextResponse } from "next/server";

const GHL_API_URL     = process.env.GHL_API_URL!;
const GHL_API_KEY     = process.env.GHL_API_KEY!;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID!;
const GHL_WORKFLOW_ID = process.env.GHL_PHOTOS_READY_WORKFLOW!;

export async function POST(req: Request) {
  try {
    const { contactId } = await req.json();
    console.log("[workflow-callback] Received webhook:", { contactId });

    const url = `${GHL_API_URL}/v1/locations/${GHL_LOCATION_ID}/workflows/${GHL_WORKFLOW_ID}/triggers`;
    console.log("[workflow-callback] Triggering workflow at", url);

    const res = await fetch(url, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GHL_API_KEY}`,
      },
      body: JSON.stringify({ contactId }),
    });

    const body = await res.text();
    console.log(`[workflow-callback] GHL response (${res.status}):`, body);
    if (!res.ok) throw new Error(`Trigger failed ${res.status}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[workflow-callback] ❌ Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
