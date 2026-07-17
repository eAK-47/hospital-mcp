/**
 * Shared Prompt Builder
 *
 * Contains the system prompt template used for generating medical briefs.
 * Consumed by both the @Prompt decorator and the AI service so the
 * instructions stay in sync.
 */
import { TelemetryInput } from './hospital-guardian.state.js';

export interface VitalsForPrompt {
  patient_id: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  blood_pressure: { systolic: number; diastolic: number };
  status: string;
  condition: string;
}

/**
 * Returns a user-facing description of the current vitals.
 */
export function buildVitalsSummary(vitals: VitalsForPrompt): string {
  return [
    `- **Patient ID:** ${vitals.patient_id}`,
    `- **Heart Rate:** ${vitals.heart_rate} BPM`,
    `- **SpO2:** ${vitals.spo2}%`,
    `- **Temperature:** ${vitals.temperature}°C`,
    `- **Blood Pressure:** ${vitals.blood_pressure.systolic}/${vitals.blood_pressure.diastolic} mmHg`,
    `- **Status:** ${vitals.status}`,
    `- **Condition:** ${vitals.condition}`,
  ].join('\n');
}

/**
 * Build the system prompt instructing the LLM to return structured JSON.
 * Used both by the @Prompt decorator and the server-side AI service.
 */
export function buildMedicalBriefsSystemPrompt(
  vitals: VitalsForPrompt,
  ecg?: string
): string {
  const ecgLine = ecg ? `\n- **ECG:** ${ecg}` : '';

  return [
    'You are a clinical AI assistant for a Hospital Guardian system.',
    'Given the following patient vitals and diagnosed condition, generate a JSON response with exactly two fields:',
    '',
    '1. "nurse_checklist": A concise Markdown bullet-list of immediate bedside tasks for the nursing staff.',
    '2. "doctor_brief": A clinical summary explaining the current state, tracking trends, and recommending next steps for the physician.',
    '',
    'IMPORTANT: Respond with raw JSON only. No markdown fences, no extra text.',
    '',
    'Current Patient Vitals:',
    buildVitalsSummary(vitals),
    ecgLine,
    '',
    'Output format:',
    '{',
    '  "nurse_checklist": "- [ ] Task 1\\n- [ ] Task 2\\n- [ ] Task 3",',
    '  "doctor_brief": "Clinical summary text here."',
    '}',
  ].join('\n');
}