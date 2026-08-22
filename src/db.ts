import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.on('error', (error) => {
  console.error('Unexpected error on idle PostgreSQL client:', error);
});

export async function shutdownDatabase(): Promise<void> {
  try {
    await db.end();
  } catch (error) {
    console.error('Error closing PostgreSQL pool:', error);
  }
}