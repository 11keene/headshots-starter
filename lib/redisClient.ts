import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: true, // ✅ Queue commands if disconnected
  retryStrategy(times) {
    return Math.min(times * 50, 2000); // Backoff retry: 50ms, 100ms, ..., max 2s
  },
  tls: {} // ✅ Enforce TLS when using rediss:// (required by Upstash)
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err);
});

setInterval(() => {
  redis.ping().catch(() => {
    // Retry will auto-handle this, no crash
  });
}, 30_000);

export default redis;
