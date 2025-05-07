// app/api/stripe/webhooks/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const buf = Buffer.from(await request.arrayBuffer());
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("❌ Signature mismatch:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const user_id = session.client_reference_id!;
    const priceId = session.metadata!.pack as string;

    // mark order paid
    await supabaseAdmin
      .from("orders")
      .update({ status: "paid" })
      .eq("session_id", session.id);

    // map price→credits
    const CREDIT_MAP: Record<string, number> = {
      price_1RJLBd4RnIZz7j08beYwRGv1:  25,
      price_1RJLCO4RnIZz7j08tJ3vN1or:  75,
      price_1RJLDE4RnIZz7j08RlQUve2s: 200,
      price_1RJLDf4RnIZz7j08TLcrNcQ6: 500,
    };
    const toAdd = CREDIT_MAP[priceId] || 0;

    if (toAdd > 0) {
      // ▶️ Read current
      const { data: userRow, error: fetchErr } = await supabaseAdmin
        .from("users")
        .select("credits")
        .eq("id", user_id)
        .single();

      if (fetchErr || !userRow) {
        console.error("⚠️ Couldn't fetch existing credits:", fetchErr);
      } else {
        // ▶️ Write back updated total
        const newTotal = (userRow.credits ?? 0) + toAdd;
        const { error: updateErr } = await supabaseAdmin
          .from("users")
          .update({ credits: newTotal })
          .eq("id", user_id);

        if (updateErr) {
          console.error("❌ Failed to update user credits:", updateErr);
        } else {
          console.log(`✅ User ${user_id} credits updated to ${newTotal}`);
        }
      }

      // ▶️ Log the grant in history
      await supabaseAdmin
        .from("credits")
        .insert({ user_id, credits: toAdd });
    }
  }

  return NextResponse.json({ received: true });
}
