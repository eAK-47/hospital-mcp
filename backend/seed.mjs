/**
 * Seed the database with the mock patients and their telemetry data
 * so the dashboard shows all patients and history works for each.
 *
 * Run: node backend/seed.mjs
 */

import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Mock patients from frontend/src/data/patients.json
const patients = [
  {
    id: 'ICU-101',
    name: 'Robert Chen',
    age: 62,
    condition: 'High Fever, low oxygen saturation',
    status: 'CRITICAL',
    vitals: { heartRate: 61, spo2: 86, temperature: 39, systolic: 91, diastolic: 55 },
  },
  {
    id: 'ICU-102',
    name: 'Maya Raman',
    age: 48,
    condition: 'Post-operative observation',
    status: 'OBSERVATION',
    vitals: { heartRate: 88, spo2: 95, temperature: 37.4, systolic: 124, diastolic: 78 },
  },
  {
    id: 'ICU-103',
    name: 'Arjun Mehta',
    age: 71,
    condition: 'Unstable blood pressure',
    status: 'WARNING',
    vitals: { heartRate: 118, spo2: 91, temperature: 38.1, systolic: 168, diastolic: 96 },
  },
  {
    id: 'ICU-104',
    name: 'Sara Williams',
    age: 36,
    condition: 'Recovering after respiratory infection',
    status: 'NORMAL',
    vitals: { heartRate: 74, spo2: 98, temperature: 36.8, systolic: 118, diastolic: 74 },
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const p of patients) {
      // Upsert patient
      await client.query(
        `INSERT INTO patients (id, name, age, condition, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           age = EXCLUDED.age,
           condition = EXCLUDED.condition,
           status = EXCLUDED.status`,
        [p.id, p.name, p.age, p.condition, p.status]
      );

      // Insert a telemetry log for this patient (if none exists yet)
      const existing = await client.query(
        'SELECT COUNT(*)::int AS count FROM telemetry_logs WHERE patient_id = $1',
        [p.id]
      );
      if (existing.rows[0].count === 0) {
        await client.query(
          `INSERT INTO telemetry_logs
           (patient_id, heart_rate, spo2, temperature, blood_pressure, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            p.id,
            p.vitals.heartRate,
            p.vitals.spo2,
            p.vitals.temperature,
            JSON.stringify({ systolic: p.vitals.systolic, diastolic: p.vitals.diastolic }),
            p.status,
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✓ Seeded patients:');
    for (const p of patients) {
      console.log(`  - ${p.id} (${p.name}) - ${p.status}`);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Seed failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();