// app/api/create-checkout-session/route.ts
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

  const { stripePriceId, packType } = body;
  // We’ll grab user ID from session:
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user_id = user.id;

  try {
    // 1) Create a new pack ID
    const generatedPackId = randomUUID();

    // 2) Insert a new row in `packs`
    const { error: insertErr } = await supabase.from("packs").insert([
      {
        id: generatedPackId,
        user_id,
        pack_type: packType,       // "professional" or "multi-purpose"
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertErr) {
      console.error("Supabase insert error (packs):", insertErr);
      return new NextResponse("Supabase insert failed", { status: 500 });
    }

    // 3) Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: "payment",
      customer_email: user.email,
      success_url: `http://localhost:3000/status/${generatedPackId}`,
      cancel_url: `${
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : process.env.NEXT_PUBLIC_BASE_URL
      }/upload/${generatedPackId}`, 
      // If they hit "Cancel," we’ll send them back to the same Upload page so they can try again.
    });

    // 4) Return the Stripe URL (front end will redirect)
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe session error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
