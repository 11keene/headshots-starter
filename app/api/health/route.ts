// app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  console.log("✅ [health] Web service is alive");
  return NextResponse.json({ status: "ok" });
}
