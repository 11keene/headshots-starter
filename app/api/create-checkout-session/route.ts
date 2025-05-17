import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { starterPacks, themedPacks, customPacks } from "@/data/packs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const {
      user_id,
      user_email,
      packId,
      extras: extrasRaw = [], // allow array or CSV
    } = (await req.json()) as {
      user_id?: string;
      user_email?: string;
      packId?: string;
      extras?: string[] | string;
    };
    console.log("[checkout] payload:", { user_id, user_email, packId, extras: extrasRaw });
    console.log("[checkout] extrasRaw:", extrasRaw);

    if (!user_id || !user_email || !packId) {
      return NextResponse.json(
        { error: "user_id, user_email and packId are required" },
        { status: 400 }
      );
    }

    // ensure user exists
    await supabaseAdmin
      .from("users")
      .upsert({ id: user_id, email: user_email }, { onConflict: "id" });

    const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    // ─── Combine all pack definitions ───
    const allPacks = [...starterPacks, ...themedPacks, ...customPacks];

    // 1️⃣ Main pack lookup
    const mainPack = allPacks.find(
      (p) => p.slug === packId || p.id === packId
    );

    if (!mainPack) {
      return NextResponse.json(
        { error: `Unknown pack: ${packId}` },
        { status: 400 }
      );
    }

    // ─── Normalize extras to a trimmed string array ───
    const extras = Array.isArray(extrasRaw)
      ? extrasRaw
      : typeof extrasRaw === "string"
      ? extrasRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    console.log("[checkout] normalized extras:", extras);

    // 2️⃣ Extras → line items
    const extraLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      extras.map((priceId) => ({ price: priceId, quantity: 1 }));

    console.log("[checkout] extraLineItems:", extraLineItems);

    // 3️⃣ Final line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: mainPack.stripePriceId!, quantity: 1 },
      ...extraLineItems,
    ];
    console.log("[checkout] final lineItems:", lineItems);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
        // ─── APPLY THE UPSELL COUPON HERE ──────────────────────────────────
    discounts: [
      { coupon: process.env.STRIPE_COUPON_UPSELL_10! }  // <- set to "10OFF_UPSELL"
      ],
      client_reference_id: user_id,
      metadata: {
        packId,
        extras: extras.join(","),
      },
      success_url: `${origin}/overview/packs/${mainPack.slug}/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/overview/packs/${mainPack.slug}/next?extraPacks=${extras.join(
        ","
      )}`,
      mode: "payment",
    } as Stripe.Checkout.SessionCreateParams);

    // record pending order
    await supabaseAdmin.from("orders").insert({
      user_id,
      pack_id: packId,
      session_id: session.id,
      price_id: mainPack.stripePriceId,
      extras: extras.join(","),
      status: "pending",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("🔥 create-checkout-session error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
