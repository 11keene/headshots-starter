import { NextResponse } from "next/server";

const GHL_API_KEY = process.env.GHL_API_KEY!;
const GHL_ACCOUNT_ID = process.env.GHL_ACCOUNT_ID!;
const GHL_CAMPAIGN_ID = process.env.GHL_CAMPAIGN_ID!;
const APP_URL = process.env.APP_URL!;

/**
 * Expected JSON payload:
 * {
 *   emails: "alice@example.com, bob@example.com, carol@example.com",
 *   teamName: "Acme Inc."
 * }
 */
export async function POST(req: Request) {
  try {
    const { emails, teamName } = (await req.json()) as {
      emails: string;
      teamName: string;
    };

    if (!emails?.trim()) {
      return NextResponse.json(
        { error: "At least one email address is required" },
        { status: 400 }
      );
    }

    // Split & dedupe
    const recipientList = Array.from(
      new Set(
        emails
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
      )
    );

    if (recipientList.length === 0) {
      return NextResponse.json(
        { error: "No valid email addresses found" },
        { status: 400 }
      );
    }

    // For each recipient, create a new contact in GHL and add them to the campaign or workflow
    const errors: string[] = [];
    for (const email of recipientList) {
      // 1) Create or upsert contact
      const contactRes = await fetch(
        `https://rest.gohighlevel.com/v1/contacts/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${GHL_API_KEY}`,
          },
          body: JSON.stringify({
            accountId: GHL_ACCOUNT_ID,
            email,
            firstName: "",    // optional
            lastName: "",     // optional
            customField: {
              teamName: teamName,
            },
          }),
        }
      );

      if (!contactRes.ok) {
        const text = await contactRes.text();
        console.error(`GHL contact create failed for ${email}: ${text}`);
        errors.push(`Failed to create contact ${email}`);
        continue;
      }

      const contactData = await contactRes.json();
      const contactId = contactData?.id;
      if (!contactId) {
        errors.push(`No contactId returned for ${email}`);
        continue;
      }

      // 2) Add contact to an existing GHL campaign or workflow (trigger email)
      //    If you have a workflow that is “When new contact created → send the invite template,”
      //    you may not need this step, because creating the contact automatically kicks off the workflow.
      //
      //    If you instead want to add them to a “Campaign,” use that endpoint:
      const campaignRes = await fetch(
        `https://rest.gohighlevel.com/v1/campaigns/${GHL_CAMPAIGN_ID}/queue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${GHL_API_KEY}`,
          },
          body: JSON.stringify({
            accountId: GHL_ACCOUNT_ID,
            contactId,
          }),
        }
      );
      if (!campaignRes.ok) {
        const txt = await campaignRes.text();
        console.error(
          `GHL campaign‐queue failed for contact ${contactId}: ${txt}`
        );
        errors.push(`Failed to queue campaign for ${email}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: `Some invites failed: ${errors.join("; ")}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sentTo: recipientList,
    });
  } catch (err: any) {
    console.error("Error in GHL send-invites API:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
