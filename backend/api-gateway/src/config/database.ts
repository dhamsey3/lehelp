import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// PostgreSQL connection pool
// Use direct Supabase connection
const pool = new Pool({
  host: 'db.eciilaafspnteitrntog.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '+PAU-.sC_@y7jRy',
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Force IPv4 family
  options: '-c search_path=public',
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
