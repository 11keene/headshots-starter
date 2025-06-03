import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();

  const { stripePriceId, user_id, user_email, packId, packType } = body;

  try {
    // 🧠 Generate a proper UUID for the pack
    const generatedPackId = randomUUID();

    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: "payment",
      customer_email: user_email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/status/${generatedPackId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${packId}`,
    });

    // ✅ Insert into Supabase
    const { error } = await supabase.from("packs").insert([
      {
        id: generatedPackId, // ✅ UUID, not "multi-purpose"
        user_id,
        type: packType, // e.g. "multi-purpose" or "headshots"
        stripe_price_id: stripePriceId,
        stripe_checkout_id: session.id,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error.message);
      return new NextResponse("Supabase insert failed", { status: 500 });
    }

    // ✅ Return Stripe URL
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
