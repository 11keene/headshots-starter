// File: pages/api/ghlSync.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { event, user } = req.body as {
      event: string;
      user: { id: string; email?: string };
    };

    // Only handle new user signups
    if (event === "user.created" && user.email) {
      const response = await fetch(
        "https://rest.gohighlevel.com/v1/contacts/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          },
          body: JSON.stringify({
            email: user.email,
            customFields: { supabase_id: user.id },
          }),
        }
      );

      if (!response.ok) {
        console.error("GHL contact sync failed:", await response.text());
      } else {
        console.log("✅ GHL contact created for", user.email);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error in /api/ghlSync:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
