// File: app/api/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Make sure STRIPE_SECRET_KEY is defined in .env.local
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  // 1) Initialize Supabase server client to look up the authenticated user
  const supabase = createRouteHandlerClient({ cookies });

  // 2) Read the JSON request body
  const body = await req.json();
  const { stripePriceId, packType, packId: existingPackId } = body;

  // 3) Ensure the user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user_id = user.id;

  try {
    // 4) Verify that the packId actually exists
    const { data: packCheck, error: packErr } = await supabase
      .from("packs")
      .select("id")
      .eq("id", existingPackId)
      .single();

    if (packErr || !packCheck) {
      console.error("Pack not found:", packErr);
      return new NextResponse("Invalid packId", { status: 400 });
    }

    // 5) Build the success/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL; // should be "http://localhost:3000"
    if (!baseUrl) {
      console.error("Missing NEXT_PUBLIC_SITE_URL in .env.local");
      return new NextResponse("Server misconfiguration", { status: 500 });
    }

    // 6) Create the Stripe Checkout Session, embedding metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${baseUrl}/status/${existingPackId}`,
      cancel_url: `${baseUrl}/cancelled`, 
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user_id,
        packId: existingPackId,
        packType: packType,
      },
      customer_email: user.email,
    });

    // 7) Return the URL so the front end can redirect
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe session error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
