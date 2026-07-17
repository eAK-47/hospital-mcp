-- =============================================================================
-- Hospital Guardian MCP Server - Supabase Schema
-- =============================================================================
-- Run this SQL in your Supabase SQL Editor to set up the database tables.
-- =============================================================================

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

-- 3. Add columns to existing tables (for databases created with the old schema)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS nurse_checklist TEXT NOT NULL DEFAULT '';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS doctor_brief TEXT NOT NULL DEFAULT '';
ALTER TABLE telemetry_logs ADD COLUMN IF NOT EXISTS nurse_checklist TEXT NOT NULL DEFAULT '';
ALTER TABLE telemetry_logs ADD COLUMN IF NOT EXISTS doctor_brief TEXT NOT NULL DEFAULT '';

-- 4. Seed the demo patient "402"
INSERT INTO patients (id, name, age, condition, status)
VALUES ('402', 'John Doe', 45, 'Stable', 'NORMAL')
ON CONFLICT (id) DO NOTHING;