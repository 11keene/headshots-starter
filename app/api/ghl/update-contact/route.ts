// File: app/api/ghl/update-contact/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { contactId, fields } = (await req.json()) as {
      contactId: string;
      fields: { Inviter_Name: string; Invite_Token: string };
    };

    if (!contactId) {
      return NextResponse.json(
        { error: "Missing contactId" },
        { status: 400 }
      );
    }
    if (!fields.Inviter_Name || !fields.Invite_Token) {
      return NextResponse.json(
        { error: "Inviter_Name and Invite_Token are required" },
        { status: 400 }
      );
    }

    // Build GHL “Update Contact” URL
    const portalId = process.env.NEXT_PUBLIC_GHL_PORTAL_ID;
    const apiKey = process.env.GHL_API_KEY;
    if (!portalId || !apiKey) {
      throw new Error("Missing GHL API credentials in env");
    }

    const updateUrl = `https://rest.gohighlevel.com/v1/contacts/${contactId}`;

    const payload = {
      // This payload structure matches GHL’s “Update Contact” endpoint.
      contact: {
        customFieldValues: [
          {
            fieldId: "Inviter_Name",        // EXACT custom field key in GHL
            fieldValue: fields.Inviter_Name,
          },
          {
            fieldId: "Invite_Token",        // EXACT custom field key in GHL
            fieldValue: fields.Invite_Token,
          },
        ],
      },
    };

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("GHL update-contact error:", text);
      return NextResponse.json(
        { error: "Failed to update contact in GHL", details: text },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ update-contact exception:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
