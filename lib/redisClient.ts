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
    "[Redis] No Upstash credentials found—using stub client."
  );
  client = {
    lpush: async () => 0,
    rpop: async () => null,
  };
} else {
  const real = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  client = {
    lpush: real.lpush.bind(real),
    rpop: async (key: string) => {
      // Upstash REST client sometimes returns { result: string }
      const res = await real.rpop(key);
      if (res && typeof res === "object" && "result" in (res as any)) {
        return (res as any).result as string;
      }
      return res as string | null;
    },
  };
}

export default client;
