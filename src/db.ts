/**
 * PostgreSQL Database Utility
 *
 * Initializes and exports a singleton PostgreSQL connection pool
 * using environment variables for configuration.
 */
import pg from 'pg';

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test connection on initialization
db.query('SELECT NOW()')
  .then(() => console.log('Successfully connected to PostgreSQL database.'))
  .catch((err) => console.error('Database connection failed:', err));