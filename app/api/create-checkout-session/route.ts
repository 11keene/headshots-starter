// File: app/api/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const body = await req.json();
  const { packType, packId: existingPackId } = body;

  // 🧠 3.5) Choose the correct Stripe Price ID based on pack type
  const PRICE_IDS: Record<"headshots" | "multi-purpose", string> = {
    headshots: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_HEADSHOTS!,
    "multi-purpose": process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MULTI!,
  };

  const stripePriceId = PRICE_IDS[packType as "headshots" | "multi-purpose"];
  if (!stripePriceId) {
    console.error("❌ Invalid or missing Stripe Price ID for packType:", packType);
    return new NextResponse("Invalid pack type", { status: 400 });
  }
if (packType === "multi-purpose") {
  console.warn("⛔ Multi-Purpose Pack is currently disabled");
  return new NextResponse("Multi-Purpose Pack is unavailable", { status: 400 });
}

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user_id = user.id;

  try {
    const { data: packRow, error: packErr } = await supabase
      .from("packs")
      .select("id, intake")
      .eq("id", existingPackId)
      .single();

    if (packErr || !packRow) {
      console.error("Pack not found:", packErr);
      return new NextResponse("Invalid packId", { status: 400 });
    }

    const gender = (packRow.intake?.gender as string) || "unspecified";
    console.log("✔ [Create Checkout] Using gender from intake:", gender);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
      console.error("Missing NEXT_PUBLIC_SITE_URL in .env.local");
      return new NextResponse("Server misconfiguration", { status: 500 });
    }

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
        gender:   gender,
      },
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe session error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
