// pages/api/ghl/create-contact.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, firstName, lastName } = req.body;
  const response = await fetch(
    `${process.env.GHL_API_URL}/contacts`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        // you can also set pipelineId & stageId here
      }),
    }
  );

  if (response.ok) {
    const contact = await response.json();
    res.status(200).json(contact);
  } else {
    const err = await response.text();
    res.status(response.status).json({ error: err });
  }
}
