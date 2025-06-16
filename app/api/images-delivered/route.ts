// File: app/api/images-delivered/route.ts
import { NextResponse } from "next/server";

const ZAPIER_IMAGES_HOOK = process.env.ZAPIER_IMAGES_HOOK!;

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName } = await req.json();
    await fetch(ZAPIER_IMAGES_HOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Images Delivered proxy error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
