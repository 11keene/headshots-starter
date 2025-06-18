// app/api/debug-redis/route.ts
import { NextResponse } from "next/server";
import redis from "@/lib/redisClient";

export async function GET() {
  try {
    await redis.set("health", "ok");
    const v = await redis.get("health");
    return NextResponse.json({ redis: v });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
