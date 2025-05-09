// File: app/api/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to enqueue Astria jobs (same logic as your /api/start-astria)
async function enqueueAstriaJobs(
  userId: string,
  packs: { prompt: string; imageCount: number }[]
) {
  for (const { prompt, imageCount } of packs) {
    const res = await fetch(`${process.env.ASTRIA_API_URL}/v1/generate`, {
      method: "POST",
      headers: { "x-api-key": process.env.ASTRIA_API_KEY! },
      body: JSON.stringify({
        modelId: process.env.ASTRIA_MODEL_ID,
        prompt,
        numOutputs: imageCount,
      }),
    });
    const { jobId } = await res.json();
    await supabaseAdmin.from("astria_jobs").insert({
      user_id: userId,
      job_id: jobId,
      status: "pending",
      pack_prompt: prompt,
    });
  }
}

export async function POST(req: Request) {
  try {
    const {
      stripePriceId,
      user_id,
      user_email,
      packId,      
      extras = [], 
    } = (await req.json()) as {
      stripePriceId?: string;
      user_id?: string;
      user_email?: string;
      packId?: string;
      extras?: string[];
    };

    if (!stripePriceId || !user_id || !user_email) {
      return NextResponse.json(
        { error: "stripePriceId, user_id and user_email are required" },
        { status: 400 }
      );
    }

    // Ensure user exists
    await supabaseAdmin
      .from("users")
      .upsert(
        { id: user_id, email: user_email, credits: 0 },
        { onConflict: "id", ignoreDuplicates: true }
      );

    const origin = headers().get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!;

    // **PACK PURCHASE BRANCH: Check credits and skip Stripe if possible**
    if (packId) {
      // 1) Load all involved packs
      const { data: packRows, error: packErr } = await supabaseAdmin
        .from("packs")
        .select("id, credit_cost, image_count, prompt_template")
        .in("id", [packId, ...extras]);
      if (packErr || !packRows) {
        console.error("❌ Could not fetch pack data:", packErr);
        throw new Error("Pack lookup failed");
      }

      // 2) Sum up required credits
      const totalCreditsNeeded = packRows.reduce(
        (sum, p) => sum + (p.credit_cost ?? 0),
        0
      );

      // 3) Fetch user's current credits
      const { data: userRow, error: userErr } = await supabaseAdmin
        .from("users")
        .select("credits")
        .eq("id", user_id)
        .single();
      if (userErr || !userRow) {
        console.error("❌ Could not fetch user credits:", userErr);
        throw new Error("User lookup failed");
      }

      if (userRow.credits >= totalCreditsNeeded) {
        // a) Atomically decrement credits and log it
        await supabaseAdmin.rpc("decrement_credits", {
          uid: user_id,
          amt: totalCreditsNeeded,
        });

        // b) Enqueue Astria jobs
        await enqueueAstriaJobs(
          user_id,
          packRows.map((p) => ({
            prompt: p.prompt_template!,
            imageCount: p.image_count!,
          }))
        );

        // c) Redirect straight to generate page
        return NextResponse.json({
          redirectTo: `${origin}/overview/packs/${packId}/generate`,
        });
      }

      // else: fall through to Stripe session (not enough credits)
    }

    // ——————————————————————————————
    // **FALLBACK: Create Stripe session** 
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: stripePriceId, quantity: 1 },
      // include extras as separate price IDs if any
      ...extras.map((p) => ({ price: p, quantity: 1 })),
    ];

    let success_url: string;
    let cancel_url: string;
    if (packId) {
      success_url = `${origin}/overview/packs/${packId}/generate?packId=${packId}&session_id={CHECKOUT_SESSION_ID}`;
      cancel_url = `${origin}/pricing?packId=${packId}`;
    } else {
      success_url = `${origin}/get-credits?status=success`;
      cancel_url = `${origin}/get-credits?status=canceled`;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      client_reference_id: user_id,
      metadata: {
        user_email,
        ...(packId ? { packId } : {}),
      },
      success_url,
      cancel_url,
    });

    // If it’s a pack purchase, record a pending order just like before
    if (packId) {
      await supabaseAdmin.from("orders").insert({
        user_id,
        pack_id: packId,
        price_id: stripePriceId,
        session_id: session.id,
        status: "pending",
        created_at: new Date().toISOString(),
      });
    }

    // Return Stripe URL exactly as before
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("🔥 create-checkout-session error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
