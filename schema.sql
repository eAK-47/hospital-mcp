-- Hospital Guardian MCP Server database schema
CREATE TABLE IF NOT EXISTS patients (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  age             INTEGER NOT NULL,
  condition       TEXT NOT NULL DEFAULT 'Stable',
  status          TEXT NOT NULL DEFAULT 'NORMAL',
  nurse_checklist TEXT NOT NULL DEFAULT '',
  doctor_brief    TEXT NOT NULL DEFAULT ''
);

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

CREATE INDEX IF NOT EXISTS idx_telemetry_patient_created
  ON telemetry_logs(patient_id, created_at DESC);

INSERT INTO patients (id, name, age, condition, status)
VALUES ('402', 'John Doe', 45, 'Stable', 'NORMAL')
ON CONFLICT (id) DO NOTHING;