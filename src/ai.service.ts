/**
 * AI Completion Service
 *
 * Calls Gemini API to generate structured nurse checklists and doctor briefs
 * from patient vitals.
 *
 * Configuration (via environment variables):
 *   AI_API_KEY   – Gemini API key
 *   AI_MODEL     – Model name (e.g., gemini-2.0-flash, gemini-1.5-pro)
 *
 * Falls back to local template-based generation if the API call fails.
 */
import { TelemetryInput } from './modules/hospital-guardian/hospital-guardian.state.js';
import { buildMedicalBriefsSystemPrompt } from './modules/hospital-guardian/prompt-builder.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AiBriefsResult {
  nurse_checklist: string; // Markdown checklist of bedside tasks
  doctor_brief: string;    // Clinical summary
}

/**
 * Calls Gemini API to generate medical briefs.
 *
 * @param telemetry  The incoming telemetry payload.
 * @param condition  The diagnosed condition (e.g. "Bradycardia", "Cardiac Arrest").
 * @returns          AiBriefsResult or null on failure.
 */
async function callGemini(
  telemetry: TelemetryInput,
  condition: string
): Promise<AiBriefsResult | null> {
  const apiKey = process.env.AI_API_KEY || '';
  const modelName = process.env.AI_MODEL || 'gemini-2.0-flash';

  if (!apiKey) {
    console.warn('No AI_API_KEY configured, skipping Gemini API call.');
    return null;
  }

  const vitals = {
    patient_id: '402',
    heart_rate: telemetry.heart_rate,
    spo2: telemetry.spo2,
    temperature: telemetry.temperature,
    blood_pressure: { systolic: telemetry.systolic, diastolic: telemetry.diastolic },
    status: 'CRITICAL',
    condition,
  };

  const systemPrompt = buildMedicalBriefsSystemPrompt(vitals, telemetry.ecg);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `${systemPrompt}\n\nGenerate the nurse checklist and doctor brief for this patient. Return ONLY valid JSON with nurse_checklist and doctor_brief fields.`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    if (!content) {
      console.error('Gemini returned empty response.');
      return null;
    }

    const parsed = JSON.parse(content) as AiBriefsResult;

    if (typeof parsed.nurse_checklist !== 'string' || typeof parsed.doctor_brief !== 'string') {
      console.error('Gemini response missing required fields.', { parsed });
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to call Gemini API:', error);
    return null;
  }
}

/**
 * Primary entry point: generates nurse checklist and doctor brief using the
 * configured Gemini API. Falls back to local template-based generation.
 *
 * @param telemetry  Incoming telemetry payload.
 * @param condition  Diagnosed condition.
 * @returns          AiBriefsResult with nurse_checklist and doctor_brief.
 */
export async function generateAiMedicalBriefs(
  telemetry: TelemetryInput,
  condition: string
): Promise<AiBriefsResult> {
  // Try Gemini first
  const aiResult = await callGemini(telemetry, condition);
  if (aiResult) {
    console.log('AI-generated briefs received from Gemini API.');
    return aiResult;
  }

  // Fallback: use the local template-based generators
  console.warn('Falling back to local template-based brief generation.');
  const { generateNurseChecklist, generateDoctorBrief } = await import(
    './modules/hospital-guardian/hospital-guardian.state.js'
  );

  return {
    nurse_checklist: generateNurseChecklist(condition),
    doctor_brief: generateDoctorBrief(condition, {
      patient_id: '402',
      heart_rate: telemetry.heart_rate,
      spo2: telemetry.spo2,
      temperature: telemetry.temperature,
      blood_pressure: { systolic: telemetry.systolic, diastolic: telemetry.diastolic },
      status: 'CRITICAL',
      condition,
      nurse_checklist: '',
      doctor_brief: '',
    }),
  };
}