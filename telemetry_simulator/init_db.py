"""
Initialize database schema for Neon.tech
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from db_config import get_db_connection

SCHEMA_SQL = """
-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  age             INTEGER NOT NULL,
  condition       TEXT NOT NULL DEFAULT 'Stable',
  status          TEXT NOT NULL DEFAULT 'NORMAL',
  nurse_checklist TEXT NOT NULL DEFAULT '',
  doctor_brief    TEXT NOT NULL DEFAULT ''
);

-- 2. Telemetry Logs Table
CREATE TABLE IF NOT EXISTS telemetry_logs (
  id              BIGSERIAL PRIMARY KEY,
  patient_id      TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  heart_rate      INTEGER NOT NULL,
  spo2            NUMERIC(5,2) NOT NULL,
  temperature     NUMERIC(5,2) NOT NULL,
  blood_pressure  JSONB NOT NULL,
  status          TEXT NOT NULL DEFAULT 'NORMAL',
  nurse_checklist TEXT NOT NULL DEFAULT '',
  doctor_brief    TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups of latest telemetry per patient
CREATE INDEX IF NOT EXISTS idx_telemetry_patient_created
  ON telemetry_logs(patient_id, created_at DESC);

-- 4. Seed the demo patient "402"
INSERT INTO patients (id, name, age, condition, status)
VALUES ('402', 'John Doe', 45, 'Stable', 'NORMAL')
ON CONFLICT (id) DO NOTHING;
"""

def init_database():
    """Initialize the database schema."""
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Execute schema
        cur.execute(SCHEMA_SQL)
        conn.commit()
        
        print("✓ Database schema initialized successfully!")
        
        # Verify tables exist
        cur.execute("SELECT COUNT(*) FROM patients")
        count = cur.fetchone()
        print(f"Patients table ready. Patient count: {count[0]}")
        
        cur.close()
        
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    init_database()