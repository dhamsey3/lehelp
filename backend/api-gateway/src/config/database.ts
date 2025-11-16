import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// PostgreSQL connection pool
// Use DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export { pool };

// Test connection
pool.on('connect', () => {
  logger.info('PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL connection error:', err);
});

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  await pool.end();
  logger.info('PostgreSQL connection pool closed');
};
