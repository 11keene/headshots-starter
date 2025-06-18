// File: app/api/create-discount-code/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json();
    console.log("📥 Incoming request:", { email, firstName });

    if (!email) {
      console.error("❌ Missing email");
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const couponId = process.env.STRIPE_FIRST_ORDER_COUPON_ID;
    if (!couponId) {
      console.error("❌ Missing coupon ID");
      return NextResponse.json({ error: "Missing STRIPE_FIRST_ORDER_COUPON_ID" }, { status: 500 });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 24h from now
    const uniqueCode = `AIMAVEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const promo = await stripe.promotionCodes.create({
      coupon: couponId,
      code: uniqueCode,
      max_redemptions: 1,
      expires_at: expiresAt,
      metadata: {
        email,
        firstName,
        source: "popup",
      },
    });

    console.log("✅ Promo code created:", promo.code);

    // ✅ Step: send promo to Zapier (this is server-side, so NO CORS issues)
    const zapPayload = {
      email,
      firstName,
      promo_code: promo.code,
      expiresAt: promo.expires_at,
    };

    const zapRes = await fetch("https://hooks.zapier.com/hooks/catch/21354233/uomxwm6/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(zapPayload),
    });

    const zapText = await zapRes.text();
    console.log("📤 Zapier response:", zapRes.status, zapText);

    if (!zapRes.ok) {
      throw new Error("Zapier failed: " + zapRes.status);
    }

    return NextResponse.json({
      success: true,
      promoCode: promo.code,
      expiresAt: promo.expires_at,
    });

  } catch (err: any) {
    console.error("❌ Error in discount code route:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
