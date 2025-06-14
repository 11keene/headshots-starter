// File: app/api/create-discount-code/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Get base coupon ID from env
    const couponId = process.env.STRIPE_COUPON_ID;
    if (!couponId) {
      return NextResponse.json({ error: "Missing STRIPE_COUPON_ID in env" }, { status: 500 });
    }

    // Set expiration for 24 hours from now
    const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 24h in seconds

    // Generate unique code (or you can use a more elegant randomizer)
    const uniqueCode = `AIMAVEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create promotion code
    const promo = await stripe.promotionCodes.create({
      coupon: couponId,
      code: uniqueCode,
      max_redemptions: 1,
      expires_at: expiresAt,
      metadata: {
        source: "popup_form",
        email,
        firstName: firstName || "",
      },
    });

    return NextResponse.json({
      success: true,
      promoCode: promo.code,
      expiresAt: promo.expires_at,
    });
  } catch (error: any) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create promo code" },
      { status: 500 }
    );
  }
}
