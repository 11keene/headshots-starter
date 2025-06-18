import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // Write test value
    await redis.set("test_key", "hello world");

    // Read it back
    const result = await redis.get("test_key");

    return NextResponse.json({ status: "success", result });
  } catch (error) {
    return NextResponse.json({ status: "error", error: (error as Error).message });
  }
}
