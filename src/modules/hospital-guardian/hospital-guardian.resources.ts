import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { db } from '../../db.js';

export class HospitalGuardianResources {
  @Resource({
    uri: 'patient://vitals',
    name: 'Patient Vitals',
    description: 'Fetch the current live vitals payload of the active patient from the database',
    mimeType: 'application/json',
    examples: {
      response: {
        patient_id: '402',
        heart_rate: 76,
        spo2: 98,
        temperature: 37.0,
        blood_pressure: { systolic: 120, diastolic: 80 },
        status: 'NORMAL',
        condition: 'Stable',
        nurse_checklist: '',
        doctor_brief: '',
      },
    },
  })
  async getPatientVitals(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching patient vitals from database');

    // Fetch the patient record
    const patientResult = await db.query('SELECT * FROM patients WHERE id = $1', ['402']);
    const patient = patientResult.rows[0];

    if (!patient) {
      ctx.logger.error('Failed to fetch patient from database');
      throw new Error('Database error: Patient not found');
    }

    // Fetch the latest telemetry log for this patient
    const telemetryResult = await db.query(
      'SELECT * FROM telemetry_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1',
      ['402']
    );
    const telemetry = telemetryResult.rows[0];

    // Build the response combining patient info + latest telemetry
    const vitals = {
      patient_id: patient.id,
      name: patient.name,
      age: patient.age,
      heart_rate: telemetry?.heart_rate ?? 0,
      spo2: telemetry?.spo2 ?? 0,
      temperature: telemetry?.temperature ?? 0,
      blood_pressure: telemetry?.blood_pressure ?? { systolic: 0, diastolic: 0 },
      status: patient.status,
      condition: patient.condition,
      nurse_checklist: '',
      doctor_brief: '',
      last_updated: telemetry?.created_at ?? null,
    };

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(vitals, null, 2),
        },
      ],
    };
  }
}
