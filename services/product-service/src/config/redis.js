const redis = require('redis');

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('Connected to Redis');
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error('Redis connection error:', error);
    // Don't throw error, allow app to continue without Redis
    console.warn('Application will continue without Redis caching');
  }
};

const getRedisClient = () => {
  return client;
};

const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    if (!client) {
      return next(); // Skip caching if Redis is not available
    }

    const key = req.originalUrl;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Cache get error:', error);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response
      if (res.statusCode === 200) {
        client.setEx(key, ttl, JSON.stringify(data)).catch(err => {
          console.error('Cache set error:', err);
        });
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

const invalidateCache = async (pattern) => {
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cacheMiddleware,
  invalidateCache
};
