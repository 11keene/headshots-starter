// lib/redisClient.ts
import { Redis as UpstashRedis } from "@upstash/redis";

type Client = {
  blpop(arg0: string, arg1: number): [any, any] | PromiseLike<[any, any]>;
  get(redisLockKey: string): unknown;
  set(key: string, value: string, opts: { ex: number }): Promise<"OK" | null>;
  lpush(key: string, val: string): Promise<number>;
  rpop(key: string): Promise<string | null>;
};

let client: Client;

const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

if (!url || !token) {
  console.warn(
    "[Redis] ⚠️ Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN—using no-op stub."
  );
  client = {
    blpop: async () => [null, null],
    get: async () => undefined,
    set: async () => "OK",
    lpush: async () => 0,
    rpop: async () => null,
  };
} else {
  const redis = new UpstashRedis({ url, token });

  client = {
    blpop: async (key: string, timeout: number) => {
      // UpstashRedis does not have a direct blpop, so simulate with polling
      const pollInterval = 500; // ms
      const endTime = Date.now() + timeout * 1000;
      while (Date.now() < endTime) {
        const value = await redis.rpop(key);
        if (value) {
          return [key, typeof value === "object" && "result" in value ? (value as any).result : value];
        }
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
      return [null, null];
    },
    get: async (redisLockKey: string) => {
      const raw = await redis.get(redisLockKey);
      if (raw && typeof raw === "object" && "result" in raw) {
        return (raw as any).result;
      }
      return raw;
    },
    set: async (key, value, opts) => {
      const result = await redis.set(key, value, opts);
      // Upstash returns "OK" or null, but may return string, so cast accordingly
      return result === "OK" ? "OK" : null;
    },
    lpush: redis.lpush.bind(redis),
    rpop: async (key: string) => {
      const raw = await redis.rpop(key);
      if (raw && typeof raw === "object" && "result" in raw) {
        return (raw as any).result as string | null;
      }
      return raw as string | null;
    },
  };
}

export default client;
