// File: app/api/create-discount-code/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Apply existing coupon ID
    const couponId = "1qwXlBij"; // Your permanent coupon in Stripe

    const promo = await stripe.promotionCodes.create({
      coupon: couponId,
      max_redemptions: 1,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expires in 24 hours
      metadata: { source: "popup", email },
    });

    return NextResponse.json({ promoCode: promo.code });
  } catch (err: any) {
    console.error("Promo code error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
