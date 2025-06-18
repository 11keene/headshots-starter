// File: lib/redisClient.ts
import { Redis } from "@upstash/redis";

type RedisClient = {
  lpush(key: string, value: string): Promise<number>;
  rpop(key: string): Promise<string | null>;
};

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let redisClient: RedisClient;

if (hasUpstash) {
  // Runtime on Render (or wherever your env vars are set): use the Upstash REST client
  redisClient = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }) as unknown as RedisClient;
} else {
  // Build‐time or missing credentials: stub out so build/static‐gen never hits a socket
  console.warn("[Redis] No Upstash credentials—using stub client.");
  redisClient = {
    lpush: async () => {
      console.warn("[Redis Stub] lpush called");
      return 0;
    },
    rpop: async () => {
      console.warn("[Redis Stub] rpop called");
      return null;
    },
  };
}

export default redisClient;
