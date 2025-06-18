// lib/redisClient.ts
import { Redis as UpstashRedis } from "@upstash/redis";

type Client = {
  lpush(key: string, val: string): Promise<number>;
  rpop(key: string): Promise<string | null>;
};

let client: Client;

const url   = process.env.UPSTASH_REDIS_REST_URL?.trim();
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

if (!url || !token) {
  console.warn(
    "[Redis] ⚠️ Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN—using no-op stub."
  );
  client = {
    lpush: async () => 0,
    rpop: async () => null,
  };
} else {
  const redis = new UpstashRedis({ url, token });

  client = {
    lpush: redis.lpush.bind(redis),
    rpop: async (key: string) => {
      const raw = await redis.rpop(key);
      // Upstash REST always returns { result: T } under the hood
      if (raw && typeof raw === "object" && "result" in raw) {
        return (raw as any).result as string | null;
      }
      // If the client already unwraps it, just return
      return raw as string | null;
    },
  };
}

export default client;
