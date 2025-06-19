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
  console.log("💳 Loaded Price ID:", process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_HEADSHOTS);

  // Destructure your optional teamId field
  const {
    packType,
    packId: existingPackId,
    teamId,
}: {
  packType: string;
  packId:   string;
  teamId?:  string;
} = body;

// 1) Pick the correct Stripe Price ID
const PRICE_IDS: Record<"headshots" | "multi-purpose", string> = {
  headshots:      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_HEADSHOTS!,
  "multi-purpose": process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MULTI!,
};
const stripePriceId = PRICE_IDS[packType as "headshots" | "multi-purpose"];
console.log("💳 Using Stripe price ID:", stripePriceId);
  if (!stripePriceId) {
    console.error("❌ Invalid packType:", packType);
    return new NextResponse("Invalid pack type", { status: 400 });
  }
  if (packType === "multi-purpose") {
    console.warn("⛔ Multi-Purpose Pack is disabled");
    return new NextResponse("Multi-Purpose Pack unavailable", { status: 400 });
  }

  // 2) Ensure user is signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 3) Fetch packRow for metadata (e.g. gender)
  const { data: packRow, error: packErr } = await supabase
    .from("packs")
    .select("intake")
    .eq("id", existingPackId)
    .single();
  if (packErr || !packRow) {
    console.error("Pack not found:", packErr);
    return new NextResponse("Invalid packId", { status: 400 });
  }
  const gender = (packRow.intake?.gender as string) || "unspecified";

  // 4) Determine if we should apply the team discount
  let applyTeamDiscount = false;
  if (teamId) {
    
    // Make sure the user is authenticated
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

    // A) Check if caller is owner of this team
    const { data: ownerRow } = await supabase
      .from("teams")
      .select("owner_id")
      .eq("id", teamId)
      .single();
    // B) Check if caller is an accepted member
    const { data: memberRow } = await supabase
      .from("team_members")
      .select("accepted")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();
    // C) Count accepted members (at least 2 required)
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

  // 5) Build Stripe session parameters
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) {
    console.error("Missing NEXT_PUBLIC_SITE_URL");
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
    packType,
    gender,
    ...(teamId ? { teamId } : {}),
  },
  customer_email: user.email,
  allow_promotion_codes: true, // ← ✅ This shows the promo code box!s
};


  // 6) Attach coupon if allowed
  if (applyTeamDiscount) {
    sessionParams.discounts = [
      { coupon: process.env.STRIPE_TEAM_COUPON_ID! }
    ];
  }

  // 7) Create the Stripe Checkout session
  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Stripe session error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
