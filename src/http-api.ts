/**
 * HTTP API Server
 * 
 * Provides REST API endpoints for the frontend to connect to.
 * Runs on a separate port from the MCP server.
 */

import { createServer } from 'http';
import { db } from './db.js';
import { evaluateVitals } from './modules/hospital-guardian/hospital-guardian.state.js';
import { generateAiMedicalBriefs } from './ai.service.js';

const PORT = process.env.HTTP_PORT || 3001;

// Helper to send JSON responses
function sendJson(res: any, data: any, statusCode = 200) {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

// Transform database patient to frontend format
function transformPatient(dbPatient: any) {
  return {
    id: dbPatient.patient_id || dbPatient.id,
    name: dbPatient.name || "John Doe",
    age: dbPatient.age || 45,
    gender: dbPatient.gender || "Male",
    room: dbPatient.room || "ICU Bed 4",
    bloodGroup: "O+",
    admissionDate: "2024-01-15",
    status: dbPatient.status || "Stable",
    condition: dbPatient.condition || "Stable",
    vitals: {
      heartRate: dbPatient.heart_rate || 0,
      bloodPressure: `${dbPatient.blood_pressure?.systolic || 0}/${dbPatient.blood_pressure?.diastolic || 0}`,
      spo2: dbPatient.spo2 || 0,
      temperature: dbPatient.temperature || 0,
      respiration: dbPatient.respiration || 0,
    },
    history: dbPatient.history || [],
    medications: dbPatient.medications || [],
    allergies: dbPatient.allergies || [],
    ecg: dbPatient.ecg || [],
  };
}

// Create HTTP server
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const path = url.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    if (path === '/api/patients' && req.method === 'GET') {
      const result = await db.query('SELECT * FROM patients');
      sendJson(res, result.rows.map(transformPatient));
    }
    else if (path.match(/^\/api\/patients\/(.+)$/) && req.method === 'GET') {
      const id = path.split('/')[3];
      const patientResult = await db.query('SELECT * FROM patients WHERE id = $1', [id]);
      const patient = patientResult.rows[0];

      if (!patient) {
        sendJson(res, { error: 'Patient not found' }, 404);
        return;
      }

      const telemetryResult = await db.query(
        'SELECT * FROM telemetry_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1',
        [id]
      );
      const telemetry = telemetryResult.rows[0];

      sendJson(res, { ...patient, ...telemetry });
    }
    else if (path === '/api/patients/priority' && req.method === 'GET') {
      const priority = ['CRITICAL', 'WARNING', 'NORMAL'];
      
      for (const status of priority) {
        const result = await db.query(
          'SELECT * FROM patients WHERE status = $1 LIMIT 1',
          [status]
        );
        if (result.rows.length > 0) {
          const patient = result.rows[0];
          
          const telemetryResult = await db.query(
            'SELECT * FROM telemetry_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1',
            [patient.id]
          );
          const telemetry = telemetryResult.rows[0];
          
          sendJson(res, { ...patient, ...telemetry });
          return;
        }
      }
      
      sendJson(res, { error: 'No patients found' }, 404);
    }
    else if (path === '/api/history' && req.method === 'GET') {
      const patientId = url.searchParams.get('patientId');
      
      if (patientId) {
        const result = await db.query(
          'SELECT * FROM telemetry_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 50',
          [patientId]
        );
        sendJson(res, result.rows.map((row: any) => ({
          id: row.id,
          patientId: row.patient_id,
          time: row.created_at,
          title: row.condition,
          description: `HR: ${row.heart_rate}, SpO2: ${row.spo2}`,
          status: row.status,
        })));
      } else {
        const result = await db.query(
          'SELECT * FROM telemetry_logs ORDER BY created_at DESC LIMIT 50'
        );
        sendJson(res, result.rows);
      }
    }
    else if (path === '/api/checklist' && req.method === 'GET') {
      const result = await db.query(
        "SELECT nurse_checklist FROM telemetry_logs WHERE nurse_checklist != '' ORDER BY created_at DESC LIMIT 1"
      );
      
      if (result.rows.length > 0 && result.rows[0].nurse_checklist) {
        const checklist = result.rows[0].nurse_checklist;
        sendJson(res, checklist.split('\n').filter((line: string) => line.includes('- [ ]')));
      } else {
        sendJson(res, []);
      }
    }
    else if (path === '/api/notifications' && req.method === 'GET') {
      const result = await db.query(
        "SELECT * FROM telemetry_logs WHERE status IN ('CRITICAL', 'WARNING') ORDER BY created_at DESC LIMIT 10"
      );
      
      sendJson(res, result.rows.map((row: any) => ({
        id: row.id,
        title: row.condition,
        message: `Patient ${row.patient_id} - ${row.status}`,
        time: row.created_at,
        status: row.status,
      })));
    }
    else if (path === '/api/connections' && req.method === 'GET') {
      try {
        await db.query('SELECT 1');
        sendJson(res, [
          { name: 'Simulator', state: 'Online' },
          { name: 'Backend', state: 'Online' },
          { name: 'Realtime Database', state: 'Online' },
          { name: 'MCP Server', state: 'Online' },
          { name: 'AI Engine', state: 'Online' },
          { name: 'Prompt Engine', state: 'Online' },
          { name: 'Tool Registry', state: 'Online' },
        ]);
      } catch (error) {
        sendJson(res, [
          { name: 'Simulator', state: 'Offline' },
          { name: 'Backend', state: 'Offline' },
          { name: 'Realtime Database', state: 'Offline' },
          { name: 'MCP Server', state: 'Offline' },
          { name: 'AI Engine', state: 'Offline' },
          { name: 'Prompt Engine', state: 'Offline' },
          { name: 'Tool Registry', state: 'Offline' },
        ]);
      }
    }
    else if (path === '/api/telemetry' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const { heart_rate, spo2, temperature, systolic, diastolic, ecg } = data;
          
          const evaluation = evaluateVitals({
            heart_rate,
            spo2,
            temperature,
            systolic,
            diastolic,
            ecg,
          });
          
          const isCritical = evaluation.isCritical;
          const condition = evaluation.condition;
          const status = isCritical ? 'CRITICAL' : 'NORMAL';
          
          const bloodPressure = { systolic, diastolic };
          const result = await db.query(
            `INSERT INTO telemetry_logs 
             (patient_id, heart_rate, spo2, temperature, blood_pressure, status) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            ['402', heart_rate, spo2, temperature, bloodPressure, status]
          );
          
          await db.query(
            'UPDATE patients SET status = $1, condition = $2 WHERE id = $3',
            [status, condition, '402']
          );
          
          sendJson(res, { success: true, data: result.rows[0] });
        } catch (error: any) {
          sendJson(res, { error: error.message }, 500);
        }
      });
    }
    else {
      sendJson(res, { error: 'Not found' }, 404);
    }
  } catch (error: any) {
    sendJson(res, { error: error.message }, 500);
  }
});

export function startHttpApi() {
  return new Promise<void>((resolve) => {
    server.listen(PORT, () => {
      console.log(`HTTP API server running on port ${PORT}`);
      resolve();
    });
  });
}

export function stopHttpApi() {
  return new Promise<void>((resolve) => {
    server.close(() => {
      console.log('HTTP API server stopped');
      resolve();
    });
  });
}