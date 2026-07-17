import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';
import { getPatientState } from './hospital-guardian.state.js';
import { buildVitalsSummary } from './prompt-builder.js';

export class HospitalGuardianPrompts {
  @Prompt({
    name: 'generate_medical_briefs',
    description:
      'Generates structured medical briefs (nurse checklist and doctor brief) based on the patient\'s current vitals. Instructs the AI to output a structured JSON response containing a priority alert checklist for Cardiac Arrest (CODE BLUE) or custom step-by-step clinical checklists for other emergencies.',
    arguments: [
      {
        name: 'patient_id',
        description: 'The patient ID to generate briefs for (optional, defaults to current active patient)',
        required: false,
      },
    ],
  })
  async generateMedicalBriefs(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating medical briefs prompt', { args });

    const state = getPatientState();
    const vitalsSummary = buildVitalsSummary(state);

    return [
      {
        role: 'user' as const,
        content: `Generate structured medical briefs for the current patient.

Current Patient Vitals:
${vitalsSummary}

Based on the patient's current vitals and condition, please output a structured JSON response with the following format:

For **Cardiac Arrest** (highest priority):
\`\`\`json
{
  "priority": "🚨 CODE BLUE",
  "condition": "Cardiac Arrest",
  "nurse_checklist": [
    "Call ICU Team",
    "Start CPR",
    "Prepare Defibrillator"
  ],
  "doctor_brief": "High-level technical summary for the Doctor Dashboard based on the specific emergency"
}
\`\`\`

For **other emergencies** (Bradycardia, Tachycardia, Hypoxia, Fever, Hypotension):
\`\`\`json
{
  "priority": "EMERGENCY",
  "condition": "<condition name>",
  "nurse_checklist": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "doctor_brief": "High-level technical summary for the Doctor Dashboard based on the specific emergency"
}
\`\`\`

For **NORMAL** state:
\`\`\`json
{
  "priority": "ROUTINE",
  "condition": "Stable",
  "nurse_checklist": [],
  "doctor_brief": "Patient is stable. No immediate action required."
}
\`\`\`

Please generate the appropriate response based on the patient's current condition: "${state.condition}".`,
      },
      {
        role: 'assistant' as const,
        content: `I'll generate the medical briefs based on the patient's current condition of "${state.condition}".

Here is the structured JSON response:

\`\`\`json
{
  "priority": "${state.status === 'CRITICAL' ? (state.condition === 'Cardiac Arrest' ? '🚨 CODE BLUE' : 'EMERGENCY') : 'ROUTINE'}",
  "condition": "${state.condition}",
  "nurse_checklist": ${JSON.stringify(
      state.nurse_checklist
        ? state.nurse_checklist
            .split('\n')
            .filter((line) => line.startsWith('- [ ]'))
            .map((line) => line.replace(/^- \[ \] \*\*(.+?)\*\*.*$/, '$1').trim())
        : []
    )},
  "doctor_brief": "${state.doctor_brief ? state.doctor_brief.split('\n')[0] : 'Patient is stable. No immediate action required.'}"
}
\`\`\`

The nurse dashboard should display the full step-by-step clinical checklist, and the doctor dashboard should show the high-level technical summary for appropriate clinical decision-making.`,
      },
    ];
  }
}
