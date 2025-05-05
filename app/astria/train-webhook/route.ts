// File: app/astria/train-webhook/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    // 1) Parse incoming webhook JSON
    const { user_id, model_id, tune } = (await request.json()) as {
      user_id?: string | null;
      model_id?: string;
      tune: { id: string };
    };

    if (!user_id || !model_id) {
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    // 2) Verify secret (if applicable)
    // … your existing secret check logic …

    // 3) Update your `models` row: mark finished and store the Astria tune ID
    const { error: updateError } = await supabaseAdmin
      .from("models")
      .update({
        // ← changed this from `modelId` to `fine_tuned_face_id`
        fine_tuned_face_id: `${tune.id}`,
        status: "finished",
      })
      .eq("id", Number(model_id));

    if (updateError) {
      console.error("Failed to update model row:", updateError);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    // 4) Respond OK
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error in train-webhook handler:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
