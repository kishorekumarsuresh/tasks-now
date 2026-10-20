import net from 'node:net';
import pg from 'pg';

const { Pool } = pg;

// Node gives each resolved IP only 250ms to connect by default ("happy eyeballs").
// The remote Neon host takes longer than that, so every attempt timed out (ETIMEDOUT).
net.setDefaultAutoSelectFamilyAttemptTimeout(2000);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of active connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Error if connection cannot be established in 10 seconds (Neon may need a few seconds to wake a suspended compute)
  ssl: { rejectUnauthorized: false }
});

// Verify connection on startup
pool.on('connect', () => {
  console.log('Connected to PostgreSQL via connection pool');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});