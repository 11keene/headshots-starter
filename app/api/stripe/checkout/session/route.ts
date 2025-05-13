// File: app/api/stripe/checkout/session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// — Initialize Supabase Admin (service role) —
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// — Initialize Stripe —
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  try {
    const { priceId, planName, user_id, user_email } = (await req.json()) as {
      priceId?: string;
      planName?: string;
      user_id?: string;
      user_email?: string;
    };

    if (!priceId || !planName || !user_id || !user_email) {
      return NextResponse.json(
        { error: "priceId, planName, user_id and user_email are required" },
        { status: 400 }
      );
    }

    // ← UP SERT THE USER (no more credits field)
    const { error: upsertErr } = await supabaseAdmin
      .from("users")
      .upsert(
        { id: user_id, email: user_email },
        { onConflict: "id", ignoreDuplicates: true }
      );
    if (upsertErr) {
      console.error("❌ Failed to upsert user:", upsertErr);
      return NextResponse.json(
        { error: "Could not create or update user" },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL!;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user_id,
      metadata: {
        user_id,
        price_id: priceId,
        plan_name: planName,
      },
      success_url: `${origin}/get-credits?status=success`,
      cancel_url: `${origin}/get-credits?status=canceled`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("❌ Stripe checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
