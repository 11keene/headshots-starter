// File: app/api/photos-ready/route.ts
import { NextResponse } from "next/server";

const ZAPIER_PHOTOS_READY_HOOK = process.env.ZAPIER_PHOTOS_READY_HOOK!;

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, packId } = await req.json();
    await fetch(ZAPIER_PHOTOS_READY_HOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName, packId }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("📸 photos-ready proxy error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
