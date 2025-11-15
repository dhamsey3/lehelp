import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

// PostgreSQL connection pool
// Use DATABASE_URL if available, otherwise use individual env vars
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  : new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'lehelp_db',
      user: process.env.POSTGRES_USER || 'lehelp_user',
      password: process.env.POSTGRES_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
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
