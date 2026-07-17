import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { supabase } from '../../supabase.js';

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
    ctx.logger.info('Fetching patient vitals from Supabase');

    // Fetch the patient record
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', '402')
      .single();

    if (patientError) {
      ctx.logger.error('Failed to fetch patient from Supabase', {
        message: patientError.message,
        code: patientError.code,
        details: patientError.details,
      });
      throw new Error(`Database error: ${patientError.message}`);
    }

    // Fetch the latest telemetry log for this patient
    const { data: telemetry, error: telemetryError } = await supabase
      .from('telemetry_logs')
      .select('*')
      .eq('patient_id', '402')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (telemetryError && telemetryError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (no telemetry yet) — that's okay
      ctx.logger.error('Failed to fetch telemetry from Supabase', {
        message: telemetryError.message,
        code: telemetryError.code,
        details: telemetryError.details,
      });
      throw new Error(`Database error: ${telemetryError.message}`);
    }

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
