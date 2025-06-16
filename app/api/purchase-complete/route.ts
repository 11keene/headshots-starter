// File: app/api/purchase-complete/route.ts
import { NextResponse } from "next/server";
const ZAPIER_PURCHASE_HOOK = process.env.ZAPIER_PURCHASE_HOOK!;

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName } = await req.json();
    await fetch(ZAPIER_PURCHASE_HOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Purchase proxy error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
