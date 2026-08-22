# Hospital Guardian MCP Server

ICU patient monitoring system with an MCP server, PostgreSQL telemetry storage, a React dashboard, and an optional Python simulator.

## Project Structure

```
src/
  db.ts       PostgreSQL pool, idle error listener, and shutdown handling
  tools.ts    MCP tool metadata, input schemas, and database handlers
  index.ts    MCP server and stdio transport entry point
schema.sql   patients and telemetry_logs tables
frontend/    React dashboard
backend/     HTTP API used by the dashboard
telemetry_simulator/  Optional telemetry producer
```

## Setup

```bash
npm install
copy .env.example .env
npm run build
```

Set `DATABASE_URL` in `.env` before using database-backed tools. The checked-in example uses only dummy local credentials:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/hospital_guardian
DB_ENABLED=true
```

Initialize PostgreSQL with `schema.sql`, or run `python telemetry_simulator/init_db.py` when Python simulator dependencies are installed.

## Run

```bash
npm start
```

The MCP server communicates over stdio. The dashboard is an independent service:

```bash
cd frontend
npm install
npm run dev
```

## MCP Tools

- `get_patient_vitals`: returns the five latest telemetry records for a patient.
- `update_patient_status`: updates a patient's optional doctor brief and status.

## MCP Client Configuration

Build the server first, then add this entry to Cline MCP settings or Claude Desktop's `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hospital-guardian": {
      "command": "node",
      "args": ["C:/hospital mcp/dist/index.js"]
    }
  }
}
```

Ensure the client process can read the project's `.env` and `DATABASE_URL`.

## Validation

```bash
npm run build
node dist/index.js
```
