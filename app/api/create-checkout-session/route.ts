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

  const { packId: existingPackId, teamId }: { packId: string; teamId?: string } = body;

  // 💳 Only Headshots supported — use its price ID
  const stripePriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_HEADSHOTS!;
  if (!stripePriceId) {
    console.error("❌ Missing Stripe price ID for Headshots");
    return new NextResponse("Stripe misconfiguration", { status: 500 });
  }

  // ✅ Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ✅ Fetch the pack row to get gender from intake
  const { data: packRow, error: packErr } = await supabase
    .from("packs")
    .select("intake")
    .eq("id", existingPackId)
    .single();
  if (packErr || !packRow) {
    console.error("❌ Pack not found:", packErr);
    return new NextResponse("Invalid packId", { status: 400 });
  }
  const gender = (packRow.intake?.gender as string) || "unspecified";

  // 🧠 Determine if team discount applies
  let applyTeamDiscount = false;
  if (teamId) {
    const { data: ownerRow } = await supabase
      .from("teams")
      .select("owner_id")
      .eq("id", teamId)
      .single();

    const { data: memberRow } = await supabase
      .from("team_members")
      .select("accepted")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    const { count: acceptedCount } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("team_id", teamId)
      .eq("accepted", true);

    if (
      (ownerRow?.owner_id === user.id || memberRow?.accepted) &&
      (acceptedCount ?? 0) >= 2
    ) {
      applyTeamDiscount = true;
    }
  }

  // 🧾 Build session params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) {
    console.error("❌ Missing NEXT_PUBLIC_SITE_URL");
    return new NextResponse("Server misconfiguration", { status: 500 });
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${baseUrl}/status/${existingPackId}`,
    cancel_url: `${baseUrl}/overview`,
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      packId: existingPackId,
      gender,
      ...(teamId ? { teamId } : {}),
    },
    customer_email: user.email,
    allow_promotion_codes: true,
  };

  if (applyTeamDiscount) {
    sessionParams.discounts = [
      { coupon: process.env.STRIPE_TEAM_COUPON_ID! },
    ];
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Stripe session error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
