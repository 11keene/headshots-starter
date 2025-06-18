// lib/redisClient.ts
import { Redis } from "@upstash/redis";

type RedisClient = {
  lpush(key: string, value: string): Promise<number>;
  rpop(key: string): Promise<string | null>;
  // add these two for your debug routes:
  set(key: string, value: string): Promise<string | null>;
  get(key: string): Promise<string | null>;
};

let redisClient: RedisClient;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  // Runtime: real Upstash client
  redisClient = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }) as RedisClient;
} else {
  // Build-time stub: include set & get
  redisClient = {
    lpush: async () => {
      console.warn("[Redis Stub] lpush in build");
      return 0;
    },
    rpop: async () => {
      console.warn("[Redis Stub] rpop in build");
      return null;
    },
    set: async (key, value) => {
      console.warn("[Redis Stub] set in build:", key, value);
      return value;
    },
    get: async (key) => {
      console.warn("[Redis Stub] get in build:", key);
      return null;
    },
  };
}

export default redisClient;
