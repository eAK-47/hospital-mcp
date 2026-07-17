import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { evaluateVitals } from './hospital-guardian.state.js';
import { generateAiMedicalBriefs } from '../../ai.service.js';
import { supabase } from '../../supabase.js';

export class HospitalGuardianTools {
  @Tool({
    name: 'trigger_emergency_alert',
    description:
      'Accepts new telemetry data (heart_rate, spo2, temperature, systolic, diastolic, and optional ecg reading). Evaluates thresholds, persists to Supabase, and returns the updated patient state indicating if a CRITICAL threshold was breached.',
    inputSchema: z.object({
      heart_rate: z.number().describe('Heart rate in BPM'),
      spo2: z.number().describe('Oxygen saturation percentage (SpO2)'),
      temperature: z.number().describe('Body temperature in Celsius'),
      systolic: z.number().describe('Systolic blood pressure in mmHg'),
      diastolic: z.number().describe('Diastolic blood pressure in mmHg'),
      ecg: z
        .string()
        .optional()
        .describe('Optional ECG reading (e.g., "Flatline" for asystole)'),
    }),
    examples: {
      request: {
        heart_rate: 0,
        spo2: 85,
        temperature: 37.0,
        systolic: 60,
        diastolic: 40,
        ecg: 'Flatline',
      },
      response: {
        patient_id: '402',
        heart_rate: 0,
        spo2: 85,
        temperature: 37.0,
        blood_pressure: { systolic: 60, diastolic: 40 },
        status: 'CRITICAL',
        condition: 'Cardiac Arrest',
        nurse_checklist:
          '🚨 **CODE BLUE – Priority Alert Checklist**\n\n- [ ] **Call ICU Team** – Page code blue immediately\n- [ ] **Start CPR** – Begin chest compressions at 100-120/min\n- [ ] **Prepare Defibrillator** – Set to 200J biphasic\n- [ ] **Establish IV Access** – Large bore peripheral line\n- [ ] **Administer Epinephrine** – 1mg IV push every 3-5 min\n- [ ] **Monitor ECG** – Continue rhythm checks\n- [ ] **Prepare Intubation Kit** – Notify Anesthesia',
        doctor_brief:
          '**Doctor Dashboard – Cardiac Arrest Technical Summary**\n\n**Patient ID:** 402\n**Vitals:** HR: 0 BPM | SpO2: 85% | Temp: 37°C | BP: 60/40\n**ECG:** Flatline (Asystole)\n\n**Diagnosis:** Cardiac Arrest / Asystole\n\n**Immediate Actions Required:**\n- Activate Code Blue protocol\n- Initiate high-quality CPR (30:2 ratio)\n- Defibrillation is NOT recommended for asystole\n- Epinephrine 1mg IV every 3-5 minutes\n- Consider advanced airway (ET intubation)\n- Reversible causes: Hs and Ts (Hypoxia, Hypovolemia, H+ acidosis, Hypo/Hyperkalemia, Hypothermia, Tension pneumothorax, Tamponade, Toxins, Thrombosis)\n\n**Prognosis:** Critical – Immediate intervention required',
      },
    },
  })
  async triggerEmergencyAlert(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Processing emergency alert telemetry', {
      heart_rate: input.heart_rate,
      spo2: input.spo2,
      temperature: input.temperature,
      systolic: input.systolic,
      diastolic: input.diastolic,
      ecg: input.ecg,
    });

    const telemetry = {
      heart_rate: input.heart_rate,
      spo2: input.spo2,
      temperature: input.temperature,
      systolic: input.systolic,
      diastolic: input.diastolic,
      ecg: input.ecg,
    };

    // 1. Evaluate thresholds using the existing Vitals Evaluator
    const evaluation = evaluateVitals(telemetry);
    const isCritical = evaluation.isCritical;
    const condition = evaluation.condition;
    const status = isCritical ? 'CRITICAL' : 'NORMAL';

    // 2. Build the blood_pressure JSONB object
    const bloodPressure = {
      systolic: telemetry.systolic,
      diastolic: telemetry.diastolic,
    };

    // 3. Insert the telemetry reading into the telemetry_logs table
    const { data: insertedLog, error: insertError } = await supabase
      .from('telemetry_logs')
      .insert({
        patient_id: '402',
        heart_rate: telemetry.heart_rate,
        spo2: telemetry.spo2,
        temperature: telemetry.temperature,
        blood_pressure: bloodPressure,
        status,
      })
      .select()
      .single();

    if (insertError) {
      ctx.logger.error('Failed to insert telemetry log into Supabase', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
      });
      throw new Error(`Database error: ${insertError.message}`);
    }

    ctx.logger.info('Telemetry log saved to Supabase', { id: insertedLog.id });

    // 4. Update the patient's status and condition in the patients table
    const { error: updateError } = await supabase
      .from('patients')
      .update({ status, condition })
      .eq('id', '402');

    if (updateError) {
      ctx.logger.error('Failed to update patient in Supabase', {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
      });
      throw new Error(`Database error: ${updateError.message}`);
    }

    ctx.logger.info('Patient record updated in Supabase', { status, condition });

    // 5. Generate alert warnings (nurse checklist + doctor brief) via AI (or fallback) if critical
    let nurse_checklist = '';
    let doctor_brief = '';

    if (isCritical) {
      const briefs = await generateAiMedicalBriefs(telemetry, condition);
      nurse_checklist = briefs.nurse_checklist;
      doctor_brief = briefs.doctor_brief;

      // 5a. Persist the AI-generated briefs into the telemetry_logs record
      const { error: briefsUpdateError } = await supabase
        .from('telemetry_logs')
        .update({ nurse_checklist, doctor_brief })
        .eq('id', insertedLog.id);

      if (briefsUpdateError) {
        ctx.logger.error('Failed to persist AI briefs to telemetry_logs', {
          message: briefsUpdateError.message,
          code: briefsUpdateError.code,
          details: briefsUpdateError.details,
        });
      } else {
        ctx.logger.info('AI-generated briefs saved to telemetry_logs', {
          logId: insertedLog.id,
        });
      }

      // 5b. Also persist the AI briefs into the patients table
      const { error: patientBriefsError } = await supabase
        .from('patients')
        .update({ nurse_checklist, doctor_brief })
        .eq('id', '402');

      if (patientBriefsError) {
        ctx.logger.error('Failed to persist AI briefs to patients table', {
          message: patientBriefsError.message,
          code: patientBriefsError.code,
          details: patientBriefsError.details,
        });
      }
    }

    // 6. Return the saved DB entry along with alert warnings
    return {
      id: insertedLog.id,
      patient_id: '402',
      heart_rate: insertedLog.heart_rate,
      spo2: insertedLog.spo2,
      temperature: insertedLog.temperature,
      blood_pressure: insertedLog.blood_pressure,
      status: insertedLog.status,
      condition,
      nurse_checklist,
      doctor_brief,
      created_at: insertedLog.created_at,
    };
  }
}
