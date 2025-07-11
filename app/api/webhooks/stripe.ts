import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const sig = req.headers["stripe-signature"]!;
  const buf = await buffer(req);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("⚠️ Webhook error:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    const metadata = session.metadata || {};

    // 1) Ensure contact exists / update in GHL
    await fetch(`${process.env.GHL_API_URL}/contacts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // 2) Move them through your GHL pipeline
    await fetch(
      `${process.env.GHL_API_URL}/pipelines/${metadata.pipelineId}/stages/${metadata.stageId}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GHL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactId: metadata.contactId }),
      }
    );

    // 3) Trigger Astria tune creation
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/astria/create-tune`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.client_reference_id,
            packId: metadata.packId,
          }),
        }
      );
    } catch (astriaErr) {
      console.error("🔥 Astria trigger failed:", astriaErr);
    }
  }

  res.json({ received: true });
}
