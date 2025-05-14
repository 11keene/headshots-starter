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
      stripePriceId,
      user_id,
      user_email,
      packId,
      extras = [],
    } = (await req.json()) as {
      stripePriceId?: string;
      user_id?: string;
      user_email?: string;
      packId?: string;
      extras?: string[];
    };

    if (!stripePriceId || !user_id || !user_email) {
      return NextResponse.json(
        { error: "stripePriceId, user_id and user_email are required" },
        { status: 400 }
      );
    }

    // ensure user exists
    await supabaseAdmin
      .from("users")
      .upsert({ id: user_id, email: user_email }, { onConflict: "id" });

    const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    // build the Stripe line items array
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: stripePriceId, quantity: 1 },
      ...extras.map((p) => ({ price: p, quantity: 1 })),
    ];

    const success_url = `${origin}/overview/packs/${packId}/generate?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${origin}/overview/packs/${packId}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      client_reference_id: user_id,
      metadata: { packId },
      success_url,
      cancel_url,
      mode: "payment",
    } as Stripe.Checkout.SessionCreateParams);

    // record a pending order (optional)
    if (packId) {
      await supabaseAdmin.from("orders").insert({
        user_id,
        pack_id: packId,
        price_id: stripePriceId,
        session_id: session.id,
        status: "pending",
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("🔥 create-checkout-session error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
