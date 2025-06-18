// lib/redisClient.ts
import { Redis as UpstashRedis } from "@upstash/redis";

type Client = {
  lpush(key: string, val: string): Promise<number>;
  rpop(key: string): Promise<string | null>;
};

let client: Client;

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  console.warn(
    "[Redis] ⚠️ Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN—using no-op stub."
  );
  client = {
    lpush: async () => 0,
    rpop: async () => null,
  };
} else {
  const redis = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  client = {
    lpush: redis.lpush.bind(redis),
    rpop: async (key: string) => {
      // Upstash REST sometimes returns { result: string }
      const raw = await redis.rpop(key);
      if (raw && typeof raw === "object" && "result" in (raw as any)) {
        return (raw as any).result;
      }
      return raw as string | null;
    },
  };
}

export default client;
