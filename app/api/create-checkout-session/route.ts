import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { themedPacks } from "@/data/packs";

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
      extras = [],
    } = (await req.json()) as {
      user_id?: string;
      user_email?: string;
      packId?: string;
      extras?: string[]; // these are slugs of extra packs
    };
    console.log(
      "[create-checkout-session] incoming body:",
      JSON.stringify({ user_id, user_email, packId, extras }, null, 2)
    );

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

    // 1️⃣ Lookup the main pack’s Stripe price ID
    const mainPack = themedPacks.find(
      (p) => p.slug === packId || p.id === packId
    );
    if (!mainPack) {
      return NextResponse.json(
        { error: `Unknown pack: ${packId}` },
        { status: 400 }
      );
    }

    // 2️⃣ Lookup each extra pack’s Stripe price ID
    const extraLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      extras
        .map((slug) => themedPacks.find((p) => p.slug === slug || p.id === slug))
        .filter((p): p is typeof mainPack => Boolean(p))
        .map((p) => ({ price: p.stripePriceId, quantity: 1 }));

    // 3️⃣ Build the final line items array
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: mainPack.stripePriceId, quantity: 1 },
      ...extraLineItems,
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      client_reference_id: user_id,
      metadata: { packId, extras: extras.join(",") },
      success_url: `${origin}/overview/packs/${mainPack.slug}/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/overview/packs/${mainPack.slug}/next?extraPacks=${extras.join(
        ","
      )}`,
      mode: "payment",
    } as Stripe.Checkout.SessionCreateParams);

    // record a pending order
    await supabaseAdmin.from("orders").insert({
      user_id,
      pack_id: packId,
      session_id: session.id,
      price_id: mainPack.stripePriceId,
      extras: extras.join(","),
      status: "pending",
      created_at: new Date().toISOString(),
    });
    console.log("[create-checkout-session] order inserted:", {
      packId,
      sessionId: session.id,
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
