// File: app/api/upload-complete/route.ts
import { NextResponse } from "next/server";

const ZAPIER_UPLOAD_HOOK = process.env.ZAPIER_UPLOAD_HOOK!;

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName } = await request.json();
    await fetch(ZAPIER_UPLOAD_HOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Upload proxy error:", err);
    return NextResponse.json(
      { error: "Failed to proxy upload webhook" },
      { status: 500 }
    );
  }
}
