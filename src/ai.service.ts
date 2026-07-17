/**
 * AI Completion Service
 *
 * Calls a configurable OpenAI-compatible LLM endpoint to generate structured
 * nurse checklists and doctor briefs from patient vitals.
 *
 * Configuration (via environment variables / ConfigService):
 *   AI_BASE_URL  – Base URL of the OpenAI-compatible API (optional, defaults to "https://api.openai.com/v1")
 *   AI_API_KEY   – API key for the endpoint (optional; requests proceed without Authorization if unset)
 *
 * Falls back to local template-based generation if the API call fails.
 */
import { TelemetryInput } from './modules/hospital-guardian/hospital-guardian.state.js';
import { buildMedicalBriefsSystemPrompt } from './modules/hospital-guardian/prompt-builder.js';

export interface AiBriefsResult {
  nurse_checklist: string; // Markdown checklist of bedside tasks
  doctor_brief: string;    // Clinical summary
}

/**
 * Calls the configured OpenAI-compatible LLM endpoint to generate medical briefs.
 *
 * @param telemetry  The incoming telemetry payload.
 * @param condition  The diagnosed condition (e.g. "Bradycardia", "Cardiac Arrest").
 * @returns          AiBriefsResult or null on failure.
 */
async function callLlm(
  telemetry: TelemetryInput,
  condition: string
): Promise<AiBriefsResult | null> {
  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const apiKey = process.env.AI_API_KEY || '';

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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the nurse checklist and doctor brief for this patient.' },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`LLM API error (${response.status}): ${errorText}`);
      return null;
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('LLM returned empty response.');
      return null;
    }

    const parsed = JSON.parse(content) as AiBriefsResult;

    if (typeof parsed.nurse_checklist !== 'string' || typeof parsed.doctor_brief !== 'string') {
      console.error('LLM response missing required fields.', { parsed });
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to call LLM API:', error);
    return null;
  }
}

/**
 * Primary entry point: generates nurse checklist and doctor brief using the
 * configured LLM endpoint. Falls back to local template-based generation.
 *
 * @param telemetry  Incoming telemetry payload.
 * @param condition  Diagnosed condition.
 * @returns          AiBriefsResult with nurse_checklist and doctor_brief.
 */
export async function generateAiMedicalBriefs(
  telemetry: TelemetryInput,
  condition: string
): Promise<AiBriefsResult> {
  // Try the LLM first
  const aiResult = await callLlm(telemetry, condition);
  if (aiResult) {
    console.log('AI-generated briefs received from LLM endpoint.');
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