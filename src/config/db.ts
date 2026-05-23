import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined
});

export const checkDatabaseConnection = async (): Promise<void> => {
  await pool.query('SELECT NOW()');
};
