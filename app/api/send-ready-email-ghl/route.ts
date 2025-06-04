// File: app/api/send-ready-email-ghl/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse incoming JSON
    const { userEmail, firstName, lastName, packId } = await req.json();
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

    // 3️⃣ Build the “upsert contact” payload, including the photos_ready tag
    const contactPayload = {
      email: userEmail,
      firstName,
      lastName,
      locationId: LOCATION_ID,
      customFields: {
        packId,
        statusLink: `https://aimavenstudio.com/status/${packId}`,
      },
      tags: ["photos_ready"], // <— this alone triggers your Tag‐Based Automation in GHL
    };

    console.log(
      "[send-ready-email-ghl] 🔍 Upserting contact with payload:",
      JSON.stringify(contactPayload)
    );

    // 4️⃣ Send POST to HighLevel’s /v1/contacts
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

    // 5️⃣ Return success; GHL’s Automation (triggered by “photos_ready” tag) will send the email
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-ready-email-ghl] ❌ Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
