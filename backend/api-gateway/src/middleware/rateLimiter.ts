import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../config/redis';

let redisClient: any;
try {
  redisClient = getRedisClient();
} catch (e) {
  // Redis not initialized yet, will use memory store
  redisClient = null;
}

// Aggressive rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    // @ts-expect-error - RedisStore types are not perfect
    client: redisClient,
    prefix: 'rl:auth:',
  }) : undefined,
});

// Standard rate limiting for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    // @ts-expect-error - RedisStore types are not perfect
    client: redisClient,
    prefix: 'rl:api:',
  }) : undefined,
});

// Strict rate limiting for sensitive operations
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: 'Too many attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    // @ts-expect-error - RedisStore types are not perfect
    client: redisClient,
    prefix: 'rl:strict:',
  }) : undefined,
});

// File upload rate limiting
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    // @ts-expect-error - RedisStore types are not perfect
    client: redisClient,
    prefix: 'rl:upload:',
  }) : undefined,
});
