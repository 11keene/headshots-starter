// File: app/api/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// Make sure your .env.local has STRIPE_SECRET_KEY set
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  // 1) Initialize Supabase (server-side) so we can look up the authenticated user
  const supabase = createRouteHandlerClient({ cookies });

  // 2) Read the request body (expected JSON)
  const body = await req.json();
const { stripePriceId, packType, packId: existingPackId } = body;
  // 3) Fetch the current user from Supabase (must be authenticated)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user_id = user.id;

  try {
// 1) Use the existing packId (created during intake)
   const packId = existingPackId;

   // (Optional) You could verify it actually exists:
   const { data: packCheck, error: packErr } = await supabase
     .from("packs")
     .select("id")
     .eq("id", packId)
     .single();
   if (packErr || !packCheck) {
     console.error("Pack not found:", packErr);
     return new NextResponse("Invalid packId", { status: 400 });
   }

   // 2) Create Stripe Checkout Session with the correct packId in metadata
   const session = await stripe.checkout.sessions.create({
     payment_method_types: ["card"],
     mode: "payment",
     success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/status/${packId}`,
     cancel_url: `http://localhost:3000/cancelled`,
     line_items: [
       { price: stripePriceId, quantity: 1 },
     ],
     metadata: {
       user_id: user_id,
       packId: packId,
       packType: packType,
     },
     customer_email: user.email,
   });


    // 7) Return the session URL back to the front end so it can redirect
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe session error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
