import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { starterPacks, themedPacks } from "@/data/packs";

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
      extras: extrasRaw = [],           // allow array or CSV
    } = (await req.json()) as {
      user_id?: string;
      user_email?: string;
      packId?: string;
      extras?: string[] | string;
    };

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

    // fetch their claimed promo code
    const { data: userPromo } = await supabaseAdmin
      .from("users")
      .select("current_promo_code")
      .eq("id", user_id)
      .single();

    const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    // 1️⃣ Main pack lookup
    const mainPack = themedPacks.find(
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
      ? extrasRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    console.log("[checkout] normalized extras:", extras);

    // ─── Combine all pack definitions ───
    const allPacks = [...starterPacks, ...themedPacks];

    // 2️⃣ Extras → line items (lookup in allPacks)
    const extraLineItems = extras
      .map((key) =>
        allPacks.find(
          (p) =>
            p.slug === key ||
            p.id === key ||
            p.stripePriceId === key
        )
      )
      .filter((p): p is typeof mainPack => Boolean(p))
      .map((p) => ({ price: p.stripePriceId, quantity: 1 }));

    console.log("[checkout] extraLineItems:", extraLineItems);

    // 3️⃣ Final line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: mainPack.stripePriceId, quantity: 1 },
      ...extraLineItems,
    ];
    console.log("[checkout] final lineItems:", lineItems);

    // Discounts (unchanged)
    const discounts = userPromo?.current_promo_code
      ? [{ coupon: userPromo.current_promo_code }]
      : undefined;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      discounts: discounts && discounts.length ? discounts : undefined,
      client_reference_id: user_id,
      metadata: {
        packId,
        extras: extras.join(","),
        promo_code: userPromo?.current_promo_code ?? "",
      },
      success_url: `${origin}/overview/packs/${mainPack.slug}/generate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/overview/packs/${mainPack.slug}/next?extraPacks=${extras.join(
        ","
      )}`,
      mode: "payment",
    } as Stripe.Checkout.SessionCreateParams);

    // record pending order (unchanged)
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
