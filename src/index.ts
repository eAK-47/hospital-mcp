/**
 * Hospital Guardian MCP Server
 *
 * Official Anthropic Model Context Protocol SDK implementation
 * with direct PostgreSQL access.
 */

import 'dotenv/config';
import pg from 'pg';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Tool input schemas
const GetPatientVitalsSchema = z.object({
  patient_id: z.string().describe('The patient ID to fetch vitals for'),
});

const UpdatePatientStatusSchema = z.object({
  patient_id: z.string().describe('The patient ID to update'),
  doctor_brief: z
    .string()
    .optional()
    .describe('Optional doctor brief to set for the patient'),
  status: z
    .string()
    .optional()
    .describe('Optional status to set for the patient'),
});

// Create MCP server
const server = new Server(
  {
    name: 'hospital-guardian-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_patient_vitals',
      description:
        'Fetches the latest telemetry vitals for a given patient from the telemetry_logs table.',
      inputSchema: {
        type: 'object',
        properties: {
          patient_id: {
            type: 'string',
            description: 'The patient ID to fetch vitals for',
          },
        },
        required: ['patient_id'],
      },
    },
    {
      name: 'update_patient_status',
      description:
        'Updates a patient\'s doctor brief and/or status in the patients table.',
      inputSchema: {
        type: 'object',
        properties: {
          patient_id: {
            type: 'string',
            description: 'The patient ID to update',
          },
          doctor_brief: {
            type: 'string',
            description: 'Optional doctor brief to set for the patient',
          },
          status: {
            type: 'string',
            description: 'Optional status to set for the patient',
          },
        },
        required: ['patient_id'],
      },
    },
  ],
}));

// Register tool execution handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_patient_vitals': {
      const parsed = GetPatientVitalsSchema.safeParse(args);
      if (!parsed.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Invalid arguments: ${parsed.error.message}`,
            },
          ],
          isError: true,
        };
      }

      const { patient_id } = parsed.data;
      const result = await pool.query(
        'SELECT * FROM telemetry_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 5',
        [patient_id]
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.rows, null, 2),
          },
        ],
      };
    }

    case 'update_patient_status': {
      const parsed = UpdatePatientStatusSchema.safeParse(args);
      if (!parsed.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Invalid arguments: ${parsed.error.message}`,
            },
          ],
          isError: true,
        };
      }

      const { patient_id, doctor_brief, status } = parsed.data;
      const result = await pool.query(
        'UPDATE patients SET doctor_brief = COALESCE($1, doctor_brief), status = COALESCE($2, status) WHERE id = $3 RETURNING *',
        [doctor_brief ?? null, status ?? null, patient_id]
      );

      if (result.rows.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Patient with id "${patient_id}" not found`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.rows[0], null, 2),
          },
        ],
      };
    }

    default:
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

// Start the server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hospital Guardian MCP server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});