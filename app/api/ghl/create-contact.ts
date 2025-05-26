// app/api/ghl/create-contact.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 2) Pull in your env vars
  const { GHL_API_KEY, GHL_API_URL, GHL_ACCOUNT_ID } = process.env;
  if (!GHL_API_KEY || !GHL_API_URL || !GHL_ACCOUNT_ID) {
    return res.status(500).json({ error: "Missing GHL_API_KEY, GHL_API_URL or GHL_ACCOUNT_ID" });
  }

  const { email, firstName, lastName } = req.body;
  const url = `${GHL_API_URL}/v1/accounts/${GHL_ACCOUNT_ID}/contacts`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email, firstName, lastName }),
    });

    const payload = await response.json();
    if (!response.ok) {
      // 3) Propagate GHL’s error message/status
      return res.status(response.status).json({ error: payload });
    }

    // 4) Success!
    return res.status(200).json(payload);

  } catch (err: any) {
    console.error("❌ create-contact error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
