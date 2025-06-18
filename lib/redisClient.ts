// File: lib/redisClient.ts

import Redis from "ioredis";

// 1) Create the Redis client with an optional retry strategy
const redis = new Redis(process.env.REDIS_URL!, {
  tls: {}, // this enables TLS (secure connection)
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});


// 2) Attach a global error handler so the worker doesn't crash on ECONNRESET
redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err);
});

// 3) (Optional) Keep the connection alive with a periodic ping
setInterval(() => {
  redis.ping().catch(() => {
    // ignore ping failures, the retryStrategy will reconnect
  });
}, 30_000); // every 30 seconds

export default redis;
