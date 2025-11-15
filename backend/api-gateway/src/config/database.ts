import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// PostgreSQL connection pool
// Use Supabase connection pooler with IPv4 for Railway compatibility
const pool = new Pool({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.eciilaafspnteitrntog',
  password: '+PAU-.sC_@y7jRy',
  ssl: { rejectUnauthorized: false },
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
