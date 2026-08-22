import { z } from 'zod';
import { db } from './db.js';

const GetPatientVitalsSchema = z.object({
  patient_id: z.string().describe('The patient ID to fetch vitals for'),
});

const UpdatePatientStatusSchema = z.object({
  patient_id: z.string().describe('The patient ID to update'),
  doctor_brief: z.string().optional().describe('Optional doctor brief to set for the patient'),
  status: z.string().optional().describe('Optional status to set for the patient'),
});

export const tools = [
  {
    name: 'get_patient_vitals',
    description: 'Fetches the latest telemetry vitals for a given patient from the telemetry_logs table.',
    inputSchema: {
      type: 'object',
      properties: { patient_id: { type: 'string', description: 'The patient ID to fetch vitals for' } },
      required: ['patient_id'],
    },
  },
  {
    name: 'update_patient_status',
    description: "Updates a patient's doctor brief and/or status in the patients table.",
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: { type: 'string', description: 'The patient ID to update' },
        doctor_brief: { type: 'string', description: 'Optional doctor brief to set for the patient' },
        status: { type: 'string', description: 'Optional status to set for the patient' },
      },
      required: ['patient_id'],
    },
  },
];

type ToolResponse = {
  content: [{ type: 'text'; text: string }];
  isError?: boolean;
};

export async function executeTool(name: string, args: unknown): Promise<ToolResponse> {
  try {
    switch (name) {
      case 'get_patient_vitals': {
        const parsed = GetPatientVitalsSchema.safeParse(args);
        if (!parsed.success) return errorResponse(`Invalid arguments: ${parsed.error.message}`);

        const result = await db.query(
          'SELECT * FROM telemetry_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 5',
          [parsed.data.patient_id],
        );
        return successResponse(JSON.stringify(result.rows, null, 2));
      }
      case 'update_patient_status': {
        const parsed = UpdatePatientStatusSchema.safeParse(args);
        if (!parsed.success) return errorResponse(`Invalid arguments: ${parsed.error.message}`);

        const { patient_id, doctor_brief, status } = parsed.data;
        const result = await db.query(
          'UPDATE patients SET doctor_brief = COALESCE($1, doctor_brief), status = COALESCE($2, status) WHERE id = $3 RETURNING *',
          [doctor_brief ?? null, status ?? null, patient_id],
        );
        if (result.rows.length === 0) return errorResponse(`Patient with id "${patient_id}" not found`);
        return successResponse(JSON.stringify(result.rows[0], null, 2));
      }
      default:
        return errorResponse(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(`Error executing ${name}: ${message}`);
  }
}

function successResponse(text: string): ToolResponse {
  return { content: [{ type: 'text', text }] };
}

function errorResponse(text: string): ToolResponse {
  return { content: [{ type: 'text', text }], isError: true };
}