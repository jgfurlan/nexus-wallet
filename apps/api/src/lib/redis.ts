import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true, // Connect on demand to prevent blocking server start if Redis is down
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
