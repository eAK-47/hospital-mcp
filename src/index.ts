import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { shutdownDatabase } from './db.js';
import { executeTool, tools } from './tools.js';

const server = new Server(
  {
    name: 'hospital-guardian-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) =>
  executeTool(request.params.name, request.params.arguments),
);

// Start the server with stdio transport
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hospital Guardian MCP server running on stdio');
}

const shutdown = async (): Promise<void> => {
  console.error('Shutting down Hospital Guardian MCP server...');
  await shutdownDatabase();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});