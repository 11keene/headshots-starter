// lib/redisClient.ts
import Redis from "ioredis";

// Make sure you have REDIS_URL set in .env.local
const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export default redis;
