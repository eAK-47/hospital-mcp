/**
 * Hospital Guardian HTTP Backend Server
 *
 * Serves the REST API endpoints consumed by the React frontend.
 * Reads real telemetry and patient data from the Neon.tech PostgreSQL database.
 *
 * Run: node backend/server.mjs
 * Listens on: http://localhost:3001
 */

import 'dotenv/config';
import http from 'http';
import pg from 'pg';

const { Pool } = pg;

const PORT = process.env.BACKEND_PORT || 3001;

// PostgreSQL connection pool (same DATABASE_URL as the MCP server)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Keep idle connections alive and avoid Neon.tech idle timeouts
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// Prevent unhandled background errors on idle clients from crashing the process
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

// ---------------------------------------------------------------------------
// Database queries
// ---------------------------------------------------------------------------
async function getPatients() {
  const result = await pool.query(
    `SELECT p.id, p.name, p.age, p.condition, p.status, p.nurse_checklist, p.doctor_brief,
            t.heart_rate, t.spo2, t.temperature, t.blood_pressure, t.created_at
     FROM patients p
     LEFT JOIN LATERAL (
       SELECT heart_rate, spo2, temperature, blood_pressure, created_at
       FROM telemetry_logs
       WHERE patient_id = p.id
       ORDER BY created_at DESC
       LIMIT 1
     ) t ON true
     ORDER BY p.id`
  );
  // Attach ECG waveform data to each patient
  return result.rows.map((row) => ({
    ...row,
    ecg: generateEcg(ecgConditionFor(row)),
  }));
}

async function getPatient(id) {
  const result = await pool.query(
    `SELECT p.id, p.name, p.age, p.condition, p.status, p.nurse_checklist, p.doctor_brief,
            t.heart_rate, t.spo2, t.temperature, t.blood_pressure, t.created_at
     FROM patients p
     LEFT JOIN LATERAL (
       SELECT heart_rate, spo2, temperature, blood_pressure, created_at
       FROM telemetry_logs
       WHERE patient_id = p.id
       ORDER BY created_at DESC
       LIMIT 1
     ) t ON true
     WHERE p.id = $1`,
    [id]
  );
  const row = result.rows[0] || null;
  if (!row) return null;
  return {
    ...row,
    ecg: generateEcg(ecgConditionFor(row)),
  };
}

async function getPriorityPatient() {
  const result = await pool.query(
    `SELECT p.id, p.name, p.age, p.condition, p.status, p.nurse_checklist, p.doctor_brief,
            t.heart_rate, t.spo2, t.temperature, t.blood_pressure, t.created_at
     FROM patients p
     LEFT JOIN LATERAL (
       SELECT heart_rate, spo2, temperature, blood_pressure, created_at
       FROM telemetry_logs
       WHERE patient_id = p.id
       ORDER BY created_at DESC
       LIMIT 1
     ) t ON true
     ORDER BY CASE p.status
       WHEN 'CRITICAL' THEN 1
       WHEN 'WARNING' THEN 2
       ELSE 3
     END
     LIMIT 1`
  );
  const row = result.rows[0] || null;
  if (!row) return null;
  return {
    ...row,
    ecg: generateEcg(ecgConditionFor(row)),
  };
}

async function getLatestTelemetry(patientId, limit = 20) {
  const result = await pool.query(
    `SELECT id, patient_id, heart_rate, spo2, temperature, blood_pressure, status,
            nurse_checklist, doctor_brief, created_at
     FROM telemetry_logs
     WHERE ($1::text IS NULL OR patient_id = $1)
     ORDER BY created_at DESC
     LIMIT $2`,
    [patientId || null, limit]
  );
  return result.rows;
}

async function getHistory(patientId) {
  // Build history events from telemetry_logs (most recent first)
  const result = await pool.query(
    `SELECT id, patient_id, heart_rate, spo2, temperature, status, created_at
     FROM telemetry_logs
     WHERE ($1::text IS NULL OR patient_id = $1)
     ORDER BY created_at DESC
     LIMIT 50`,
    [patientId || null]
  );

  return result.rows.map((row, index) => ({
    id: `h-${row.id}`,
    patientId: row.patient_id,
    time: new Date(row.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    title: row.status === 'CRITICAL' ? 'Critical Alert' : row.status === 'WARNING' ? 'Warning' : 'Vitals Update',
    description: `Telemetry recorded: HR ${row.heart_rate} bpm, SpO₂ ${row.spo2}%, Temp ${row.temperature}°C`,
    status: row.status === 'CRITICAL' ? 'Critical' : row.status === 'WARNING' ? 'Urgent' : 'Stable',
  }));
}

// ---------------------------------------------------------------------------
// ECG waveform generator
// ---------------------------------------------------------------------------
// Generates {t, v} ECG points based on the patient's condition.
// Mirrors telemetry_simulator/ecg.py waveform patterns.
function generateEcg(condition, numPoints = 250) {
  const points = [];
  const sampleRate = 250;

  for (let i = 0; i < numPoints; i++) {
    const t = i / sampleRate;
    let value = 0;

    if (condition === 'Cardiac Arrest') {
      // Flatline with occasional spikes
      value = Math.random() < 0.02 ? (Math.random() * 0.6 - 0.3) : (Math.random() * 0.02 - 0.01);
    } else if (condition === 'Bradycardia') {
      const phase = t % 1.2;
      if (phase > 0.01 && phase < 0.03) value += 0.1 * Math.sin(phase * 100);
      if (phase > 0.03 && phase < 0.04) value += 1.0 * Math.sin(phase * 200);
      if (phase > 0.04 && phase < 0.06) value += 0.3 * Math.sin(phase * 150);
      value += Math.random() * 0.06 - 0.03;
    } else if (condition === 'Tachycardia') {
      const phase = t % 0.4;
      if (phase > 0.01 && phase < 0.02) value += 0.1 * Math.sin(phase * 150);
      if (phase > 0.02 && phase < 0.025) value += 1.0 * Math.sin(phase * 300);
      if (phase > 0.025 && phase < 0.035) value += 0.3 * Math.sin(phase * 200);
      value += Math.random() * 0.08 - 0.04;
    } else if (condition === 'Hypoxia') {
      const phase = t % 0.6;
      if (phase > 0.01 && phase < 0.025) value += 0.1 * Math.sin(phase * 100);
      if (phase > 0.025 && phase < 0.035) value += 0.8 * Math.sin(phase * 180);
      if (phase > 0.035 && phase < 0.05) value += 0.2 * Math.sin(phase * 120);
      value += Math.random() * 0.1 - 0.05;
    } else if (condition === 'High Fever') {
      const phase = t % 0.7;
      if (phase > 0.01 && phase < 0.025) value += 0.1 * Math.sin(phase * 100);
      if (phase > 0.025 && phase < 0.035) value += 0.9 * Math.sin(phase * 180);
      if (phase > 0.035 && phase < 0.05) value += 0.25 * Math.sin(phase * 120);
      value += Math.random() * 0.06 - 0.03;
    } else if (condition === 'Hypotension') {
      const phase = t % 0.75;
      if (phase > 0.01 && phase < 0.025) value += 0.08 * Math.sin(phase * 100);
      if (phase > 0.025 && phase < 0.035) value += 0.7 * Math.sin(phase * 180);
      if (phase > 0.035 && phase < 0.05) value += 0.2 * Math.sin(phase * 120);
      value += Math.random() * 0.04 - 0.02;
    } else {
      // Normal sinus rhythm
      const phase = t % 0.8;
      if (phase > 0.01 && phase < 0.03) value += 0.1 * Math.sin(phase * 100);
      if (phase > 0.03 && phase < 0.04) value += 1.0 * Math.sin(phase * 200);
      if (phase > 0.04 && phase < 0.06) value += 0.3 * Math.sin(phase * 150);
      value += Math.random() * 0.04 - 0.02;
    }

    points.push({ t: Number(t.toFixed(3)), v: Number(value.toFixed(4)) });
  }

  return points;
}

// Map database status to ECG condition pattern
function ecgConditionFor(patient) {
  const hr = patient.heart_rate ?? 0;
  const spo2 = Number(patient.spo2 ?? 0);
  const temp = Number(patient.temperature ?? 0);
  const systolic = patient.blood_pressure?.systolic ?? 0;

  if (hr === 0) return 'Cardiac Arrest';
  if (hr < 50) return 'Bradycardia';
  if (hr > 120) return 'Tachycardia';
  if (spo2 < 90) return 'Hypoxia';
  if (temp > 39) return 'High Fever';
  if (systolic < 90) return 'Hypotension';
  return 'Normal';
}

// ---------------------------------------------------------------------------
// AI recommendation engine
// ---------------------------------------------------------------------------
// Condition detection thresholds (mirrors telemetry_simulator/constants.py)
const CONDITIONS = [
  {
    name: 'Cardiac Arrest',
    match: (v) => v.heart_rate === 0,
    confidence: (v) => (v.heart_rate === 0 ? 98 : 0),
    actions: [
      'Follow ACLS Protocol',
      'Continue CPR with high-quality compressions',
      'Prepare for defibrillation if shockable rhythm',
      'Administer Epinephrine 1mg IV every 3-5 min',
      'Prepare intubation kit and notify anesthesia',
    ],
    summary: 'Cardiac Arrest Detected. Start CPR immediately.',
  },
  {
    name: 'Bradycardia',
    match: (v) => v.heart_rate < 50,
    confidence: (v) => Math.min(95, Math.round(60 + (50 - v.heart_rate) * 2)),
    actions: [
      'Review medications for bradycardia side effects',
      'Evaluate pacemaker requirement',
      'Administer Atropine 0.5-1mg IV',
      'Prepare for transcutaneous pacing if unresponsive',
    ],
    summary: 'Heart rate below 50 BPM. Immediate assessment required.',
  },
  {
    name: 'Tachycardia',
    match: (v) => v.heart_rate > 120,
    confidence: (v) => Math.min(95, Math.round(60 + (v.heart_rate - 120) * 1.5)),
    actions: [
      'Obtain 12-lead ECG to identify rhythm origin',
      'Review electrolyte levels (K+, Mg2+)',
      'Consider rate control medication',
      'Prepare Adenosine 6mg rapid IV push if SVT',
    ],
    summary: 'Heart rate above 120 BPM. Assess for underlying cause.',
  },
  {
    name: 'Hypoxia',
    match: (v) => v.spo2 < 90,
    confidence: (v) => Math.min(95, Math.round(60 + (90 - v.spo2) * 2)),
    actions: [
      'Evaluate respiratory failure',
      'Start oxygen therapy 15L via non-rebreather',
      'Request chest imaging',
      'Prepare ventilator if oxygenation fails',
    ],
    summary: 'SpO₂ below 90%. Oxygen therapy required.',
  },
  {
    name: 'High Fever',
    match: (v) => v.temperature > 39,
    confidence: (v) => Math.min(95, Math.round(60 + (v.temperature - 39) * 20)),
    actions: [
      'Investigate infection source',
      'Start antibiotics if indicated',
      'Consider blood cultures',
      'Administer antipyretic and cooling measures',
    ],
    summary: 'Temperature above 39°C. Investigate infection source.',
  },
  {
    name: 'Hypotension',
    match: (v) => v.systolic < 90,
    confidence: (v) => Math.min(95, Math.round(60 + (90 - v.systolic) * 2)),
    actions: [
      'Administer IV fluids bolus',
      'Consider vasopressors if fluid-refractory',
      'Assess for sepsis',
      'Raise legs and monitor BP closely',
    ],
    summary: 'Blood pressure critically low. Administer IV fluids.',
  },
];

function detectCondition(vitals) {
  for (const c of CONDITIONS) {
    if (c.match(vitals)) {
      return c;
    }
  }
  return null;
}

function getAiRecommendation(patient) {
  const vitals = {
    heart_rate: patient.heart_rate ?? 0,
    spo2: Number(patient.spo2 ?? 0),
    temperature: Number(patient.temperature ?? 0),
    systolic: patient.blood_pressure?.systolic ?? 0,
    diastolic: patient.blood_pressure?.diastolic ?? 0,
  };

  const condition = detectCondition(vitals);

  if (!condition) {
    return {
      condition: 'Stable',
      confidence: 92,
      summary: 'Vitals are within normal range. Continue routine monitoring.',
      actions: [
        'Continue routine vital monitoring',
        'Maintain current medication regimen',
        'Encourage early mobilization if appropriate',
        'Monitor for any deterioration in vitals',
      ],
    };
  }

  return {
    condition: condition.name,
    confidence: condition.confidence(vitals),
    summary: condition.summary,
    actions: condition.actions,
  };
}

// Nurse checklist templates per condition (mirrors telemetry_simulator/ai_client.py)
const NURSE_CHECKLISTS = {
  'Cardiac Arrest': [
    'Call ICU Team – Page code blue immediately',
    'Start CPR – Begin chest compressions at 100-120/min',
    'Prepare Defibrillator – Set to 200J biphasic',
    'Establish IV Access – Large bore peripheral line',
    'Administer Epinephrine – 1mg IV push every 3-5 min',
    'Monitor ECG – Continue rhythm checks',
    'Prepare Intubation Kit – Notify Anesthesia',
  ],
  'Bradycardia': [
    'Bring Crash Cart',
    'Prepare Atropine',
    'Continuous ECG Monitoring',
    'Call Doctor Immediately',
  ],
  'Tachycardia': [
    'Provide Oxygen',
    'Monitor Blood Pressure',
    'Attach ECG Leads',
    'Notify Doctor',
  ],
  'Hypoxia': [
    'Administer Oxygen',
    'Check Airway',
    'Prepare Ventilator',
    'Call Doctor',
  ],
  'High Fever': [
    'Measure Temperature',
    'Collect Blood Sample',
    'Administer Antipyretic',
    'Notify Doctor',
  ],
  'Hypotension': [
    'Raise Legs',
    'Start IV Fluids',
    'Monitor Blood Pressure',
    'Call Doctor',
  ],
};

function getAiChecklist(patient) {
  const vitals = {
    heart_rate: patient.heart_rate ?? 0,
    spo2: Number(patient.spo2 ?? 0),
    temperature: Number(patient.temperature ?? 0),
    systolic: patient.blood_pressure?.systolic ?? 0,
    diastolic: patient.blood_pressure?.diastolic ?? 0,
  };

  const condition = detectCondition(vitals);
  const conditionName = condition ? condition.name : 'Stable';
  const tasks = condition ? NURSE_CHECKLISTS[condition.name] : [
    'Continue routine vital monitoring',
    'Maintain current medication regimen',
    'Monitor for any deterioration in vitals',
    'Document patient observations',
  ];

  return {
    condition: conditionName,
    items: tasks.map((label, index) => ({ id: `ai-${index}`, label })),
  };
}

// ---------------------------------------------------------------------------
// Static data (checklist, notifications, connections)
// ---------------------------------------------------------------------------
const checklist = [
  { id: 'call-doctor', label: 'Call Doctor' },
  { id: 'crash-cart', label: 'Bring Crash Cart' },
  { id: 'connect-ecg', label: 'Connect ECG' },
  { id: 'prepare-medication', label: 'Prepare Emergency Medication' },
  { id: 'maintain-airway', label: 'Maintain Airway' },
  { id: 'monitor-bp', label: 'Monitor Blood Pressure' },
  { id: 'prepare-defibrillator', label: 'Prepare Defibrillator if required' },
];

const notifications = [
  {
    id: 'n-1',
    title: 'Critical alert',
    message: 'Patient 402 requires immediate doctor review.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Critical',
  },
  {
    id: 'n-2',
    title: 'Observation update',
    message: 'Telemetry feed is active and streaming.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Observation',
  },
];

const connections = [
  { name: 'Simulator', state: 'Online' },
  { name: 'Backend', state: 'Online' },
  { name: 'Realtime Database', state: 'Online' },
  { name: 'MCP Server', state: 'Online' },
  { name: 'AI Engine', state: 'Online' },
  { name: 'Prompt Engine', state: 'Online' },
  { name: 'Tool Registry', state: 'Online' },
];

// ---------------------------------------------------------------------------
// Request router
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // GET /api/patients
    if (method === 'GET' && path === '/api/patients') {
      const rows = await getPatients();
      return sendJson(res, 200, rows);
    }

    // GET /api/patients/priority
    if (method === 'GET' && path === '/api/patients/priority') {
      const row = await getPriorityPatient();
      if (!row) return sendError(res, 404, 'No priority patient found');
      return sendJson(res, 200, row);
    }

    // GET /api/patients/:id
    const patientMatch = path.match(/^\/api\/patients\/([^/]+)$/);
    if (method === 'GET' && patientMatch) {
      const row = await getPatient(decodeURIComponent(patientMatch[1]));
      if (!row) return sendError(res, 404, `Patient "${patientMatch[1]}" not found`);
      return sendJson(res, 200, row);
    }

    // GET /api/telemetry/latest?patientId=...
    if (method === 'GET' && path === '/api/telemetry/latest') {
      const patientId = url.searchParams.get('patientId');
      const rows = await getLatestTelemetry(patientId, 20);
      return sendJson(res, 200, rows);
    }

    // GET /api/history?patientId=...
    if (method === 'GET' && path === '/api/history') {
      const patientId = url.searchParams.get('patientId');
      const rows = await getHistory(patientId);
      return sendJson(res, 200, rows);
    }

    // GET /api/checklist
    if (method === 'GET' && path === '/api/checklist') {
      return sendJson(res, 200, checklist);
    }

    // GET /api/notifications
    if (method === 'GET' && path === '/api/notifications') {
      return sendJson(res, 200, notifications);
    }

    // GET /api/connections
    if (method === 'GET' && path === '/api/connections') {
      return sendJson(res, 200, connections);
    }

    // GET /api/ai/recommendation?patientId=...
    if (method === 'GET' && path === '/api/ai/recommendation') {
      const patientId = url.searchParams.get('patientId') || '402';
      const patient = await getPatient(patientId);
      if (!patient) return sendError(res, 404, `Patient "${patientId}" not found`);
      const recommendation = getAiRecommendation(patient);
      return sendJson(res, 200, {
        patient_id: patient.id,
        ...recommendation,
        doctor_brief: patient.doctor_brief || '',
      });
    }

    // GET /api/ai/checklist?patientId=...
    if (method === 'GET' && path === '/api/ai/checklist') {
      const patientId = url.searchParams.get('patientId') || '402';
      const patient = await getPatient(patientId);
      if (!patient) return sendError(res, 404, `Patient "${patientId}" not found`);
      const checklist = getAiChecklist(patient);
      return sendJson(res, 200, {
        patient_id: patient.id,
        ...checklist,
      });
    }

    // POST /api/telemetry
    if (method === 'POST' && path === '/api/telemetry') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const data = JSON.parse(body || '{}');

      const result = await pool.query(
        `INSERT INTO telemetry_logs
         (patient_id, heart_rate, spo2, temperature, blood_pressure, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          data.patient_id || '402',
          data.heart_rate ?? 0,
          data.spo2 ?? 0,
          data.temperature ?? 0,
          JSON.stringify({
            systolic: data.systolic ?? 0,
            diastolic: data.diastolic ?? 0,
          }),
          data.status || 'NORMAL',
        ]
      );

      return sendJson(res, 201, result.rows[0]);
    }

    // Health check
    if (method === 'GET' && path === '/api/health') {
      return sendJson(res, 200, { status: 'ok', time: new Date().toISOString() });
    }

    return sendError(res, 404, `Not found: ${method} ${path}`);
  } catch (error) {
    console.error('Backend error:', error);
    return sendError(res, 500, error.message || 'Internal server error');
  }
});

server.listen(PORT, () => {
  console.log(`Hospital Guardian backend running on http://localhost:${PORT}`);
  console.log(`  GET /api/patients`);
  console.log(`  GET /api/patients/:id`);
  console.log(`  GET /api/patients/priority`);
  console.log(`  GET /api/telemetry/latest?patientId=402`);
  console.log(`  GET /api/history?patientId=402`);
  console.log(`  GET /api/checklist`);
  console.log(`  GET /api/notifications`);
  console.log(`  GET /api/connections`);
  console.log(`  POST /api/telemetry`);
});