// File: app/api/webhook/astria/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();

  console.log("📥 Astria Webhook Received:", JSON.stringify(body, null, 2));

  const promptId = body?.id;
  const images = body?.images || [];

  if (!promptId || images.length === 0) {
    console.warn("❌ Webhook missing promptId or images");
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    // For each image, insert a row in generated_images
    const inserts = images.map((imageUrl: string) => ({
      prompt_id: promptId,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("generated_images").insert(inserts);
    if (error) throw error;

    console.log(`✅ Saved ${images.length} image(s) for prompt ${promptId}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Failed to save generated images:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
