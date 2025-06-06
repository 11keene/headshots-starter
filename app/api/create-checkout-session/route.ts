// File: app/api/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  // 1) Initialize Supabase server client (tied to the user’s cookies)
  const supabase = createRouteHandlerClient({ cookies });

  // 2) Read the JSON request body from the client
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
    // 4) Verify that the packId actually exists, and fetch its intake.gender
    const { data: packRow, error: packErr } = await supabase
      .from("packs")
      .select("id, intake")            // Grab both id and the entire intake JSON
      .eq("id", existingPackId)        // Look only at the row matching this ID
      .single();                       // Expect exactly one row

    if (packErr || !packRow) {
      console.error("Pack not found:", packErr);
      return new NextResponse("Invalid packId", { status: 400 });
    }

    // 4a) Extract the 'gender' field from the intake JSON
    //     If intake or intake.gender is missing, fall back to "unspecified"
    const gender = (packRow.intake?.gender as string) || "unspecified";
    console.log("✔ [Create Checkout] Using gender from intake:", gender);

    // 5) Build the success/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
      console.error("Missing NEXT_PUBLIC_SITE_URL in .env.local");
      return new NextResponse("Server misconfiguration", { status: 500 });
    }

    // 6) Create the Stripe Checkout Session, embedding metadata (including gender)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${baseUrl}/status/${existingPackId}`,
      cancel_url:  `${baseUrl}/cancelled`,
      line_items: [
        {
          price:    stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id:  user_id,
        packId:   existingPackId,
        packType: packType,
        gender:   gender,       // <-- Here’s where we pass the user’s gender
      },
      customer_email: user.email,
    });

    // 7) Return the session URL so the client can redirect the user
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe session error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
