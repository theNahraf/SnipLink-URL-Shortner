const Redis = require('ioredis');
const env = require('./env');

const redisOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
  lazyConnect: false,
};

if (env.REDIS_URL && env.REDIS_URL.startsWith('rediss://')) {
  redisOptions.tls = { rejectUnauthorized: false };
}

const redis = new Redis(env.REDIS_URL, redisOptions);

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

// Separate connection for BullMQ (it needs its own)
const createBullConnection = () => {
  const options = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
  
  if (env.REDIS_URL && env.REDIS_URL.startsWith('rediss://')) {
    options.tls = { rejectUnauthorized: false };
  }
  
  return new Redis(env.REDIS_URL, options);
};

module.exports = { redis, createBullConnection };
