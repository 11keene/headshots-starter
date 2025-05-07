// File: app/api/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const {
      packId,
      stripePriceId,
      user_id,
      user_email,
      extras = [],
    } = (await req.json()) as {
      packId?: string;
      stripePriceId?: string;
      user_id?: string;
      user_email?: string;
      extras?: string[];
    };

    console.log("💬 [create-session] payload:", {
      packId,
      stripePriceId,
      user_id,
      user_email,
      extras,
    });

    if (!packId || !stripePriceId || !user_id || !user_email) {
      return NextResponse.json(
        { error: "packId, stripePriceId, user_id and user_email are required" },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("users")
      .upsert(
        { id: user_id, email: user_email, credits: 0 },
        { onConflict: "id", ignoreDuplicates: true }
      );

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: stripePriceId, quantity: 1 },
      ...extras.map((p) => ({ price: p, quantity: 1 })),
    ];

    const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;
    const session = await stripe.checkout.sessions.create({
      mode:                 "payment",
      payment_method_types: ["card"],
      line_items:           lineItems,
      client_reference_id:  user_id,

      metadata: {
        packId: packId,
        priceId: stripePriceId,
      },

      success_url: `${origin}/overview/packs/${packId}/generate?packId=${packId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/pricing?packId=${packId}`,
    });
    console.log("✅ Stripe session created:", session.id);

    const { error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id,
        pack_id:    packId,
        price_id:   stripePriceId,
        session_id: session.id,
        status:     "pending",
        created_at: new Date().toISOString(),
      });
    if (orderErr) console.error("❌ Failed to insert order:", orderErr);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("🔥 create-checkout-session error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
