import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

let redisClient: RedisClientType;

export const initRedis = async (): Promise<RedisClientType> => {
  const redisConfig: any = {
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  };
  
  // Only add password if it's set and not empty
  const password = process.env.REDIS_PASSWORD?.trim();
  if (password && password.length > 0) {
    redisConfig.password = password;
  }
  
  redisClient = createClient(redisConfig);

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  await redisClient.connect();
  return redisClient;
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initRedis() first.');
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};
