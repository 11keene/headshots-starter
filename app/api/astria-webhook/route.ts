// File: app/api/astria-webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // needs to be service role to read/write
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tuneId = body.tune_id;
    const status = body.status;
    const images = body.images;

    console.log(`[Astria Webhook] Received update:`, { tuneId, status });

    if (status !== "completed") {
      return NextResponse.json({ message: "Tune not completed yet." });
    }

    // 1️⃣ Look up the related pack in Supabase
    const { data: pack } = await supabase
      .from("packs")
      .select("*")
      .eq("tune_id", tuneId)
      .single();

    if (!pack) {
      console.error("❌ No matching pack found for tune:", tuneId);
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const userId = pack.user_id;

    // 2️⃣ Look up the user
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!user) {
      console.error("❌ No matching user found for ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3️⃣ Save the final images to Supabase
    const insertImages = images.map((url: string) => ({
      user_id: user.id,
      pack_id: pack.id,
      image_url: url,
    }));

    await supabase.from("generated_images").insert(insertImages);

    // 4️⃣ Trigger the GHL email
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-ready-email-ghl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        packId: pack.id,
      }),
    });

    console.log("📧 GHL email triggered successfully");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error in Astria webhook:", err);
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
