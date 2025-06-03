import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🔵 [GHL] Tag-by-email request received");

  try {
    const { email, tag } = await req.json();

    if (!email || !tag) {
      return NextResponse.json({ error: "Email and tag are required" }, { status: 400 });
    }

    const apiKey = process.env.GHL_API_KEY;
    if (!apiKey) throw new Error("Missing GHL_API_KEY");

    // Step 1: Look up contact by email
    const lookupUrl = `https://rest.gohighlevel.com/v1/contacts/?email=${encodeURIComponent(email)}`;
    const lookupRes = await fetch(lookupUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const lookupData = await lookupRes.json();

    const contact = lookupData.contacts?.[0];
    if (!contact || !contact.id) {
      console.error("❌ Contact not found by email:", email);
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const contactId = contact.id;
    console.log(`📧 Found contact ID ${contactId} for email ${email}`);

    // Step 2: Tag the contact
    const tagUrl = `https://rest.gohighlevel.com/v1/contacts/${contactId}/tags/${tag}`;
    const tagRes = await fetch(tagUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🟠 Tag response status:", tagRes.status);

    if (!tagRes.ok) {
      const text = await tagRes.text();
      return NextResponse.json(
        { error: "Failed to apply tag", details: text },
        { status: tagRes.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("🔥 GHL tag-by-email failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
