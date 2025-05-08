// app/api/create-checkout-session/route.ts
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
    // 1) Parse incoming JSON
    const {
      stripePriceId,
      user_id,
      user_email,
      packId,        // ← if present, this is a pack purchase
      extras = [],   // ← optional extra‐packs
    } = (await req.json()) as {
      stripePriceId?: string;
      user_id?: string;
      user_email?: string;
      packId?: string;
      extras?: string[];
    };

    // 2) Validate
    if (!stripePriceId || !user_id || !user_email) {
      return NextResponse.json(
        { error: "stripePriceId, user_id and user_email are required" },
        { status: 400 }
      );
    }

    // 3) Make sure user exists
    await supabaseAdmin
      .from("users")
      .upsert(
        { id: user_id, email: user_email, credits: 0 },
        { onConflict: "id", ignoreDuplicates: true }
      );

    // 4) Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: stripePriceId, quantity: 1 },
      ...extras.map((p) => ({ price: p, quantity: 1 })),
    ];

    // 5) Decide URLs
    const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;
    let success_url: string;
    let cancel_url: string;
    if (packId) {
      success_url = `${origin}/overview/packs/${packId}/generate?packId=${packId}&session_id={CHECKOUT_SESSION_ID}`;
      cancel_url  = `${origin}/pricing?packId=${packId}`;
    } else {
      success_url = `${origin}/get-credits?status=success`;
      cancel_url  = `${origin}/get-credits?status=canceled`;
    }

    // 6) Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items:           lineItems,
      client_reference_id:  user_id,
      metadata: {
        user_email,
        ...(packId ? { packId } : {}),
      },
      success_url,
      cancel_url,
    });

    // 7) If it was a pack purchase, record the pending order
    if (packId) {
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
    }

    // 8) Return the redirect URL
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("🔥 create-checkout-session error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
