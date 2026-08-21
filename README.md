# Hospital Guardian MCP Server

ICU Patient Monitoring System with AI-powered medical briefs and real-time telemetry.

## Features

- **MCP Server**: Official Anthropic Model Context Protocol SDK implementation
- **PostgreSQL**: Direct database access via `pg` connection pool
- **Telemetry Simulator**: Python-based simulator for testing
- **Frontend**: React + TypeScript + Vite dashboard

## Project Structure

```
├── src/                    # MCP Server (TypeScript)
│   └── index.ts            # Server entry point (MCP SDK + PostgreSQL)
├── frontend/                # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── telemetry_simulator/     # Python telemetry simulator
│   ├── simulator.py         # Main simulator entry point
│   ├── vitals.py            # Vital signs engine
│   ├── ecg.py               # ECG waveform generator
│   ├── constants.py         # Constants and configuration
│   ├── config.py            # Configuration dataclasses
│   ├── db_config.py         # Database integration
│   ├── ai_client.py         # AI brief generation client
│   ├── init_db.py           # Database initialization
│   ├── test_db.py           # Database tests
│   └── requirements.txt     # Python dependencies
├── schema.sql               # Database schema
├── .gitignore
├── .env.example
└── README.md
```

## Environment Setup

### 1. Copy Environment Files

```bash
# Backend
cp .env.example .env

# Frontend
cd frontend
cp .env.example .env
```

### 2. Environment Variables

**Backend (.env):**
```bash
# PostgreSQL Database Configuration (Neon.tech)
DATABASE_URL=postgresql://neondb_owner:npg_mwEK7S9kiOPz@ep-little-meadow-awdnjdk6.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require

# Telemetry Simulator Configuration
DB_ENABLED=true
```

**Frontend (.env in frontend folder):**
```bash
# Backend API URL
VITE_BACKEND_BASE_URL=http://localhost:3001

# Set to false to use real API, true to use mock data
VITE_USE_MOCK_DATA=false
```

## Quick Start

### 1. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Initialize Database

```bash
# Run schema migration on Neon.tech
python telemetry_simulator/init_db.py
```

### 3. Start Services

```bash
# Terminal 1: Start MCP Server
npm run build
npm start

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 4. Run Telemetry Simulator (Optional)

```bash
python telemetry_simulator/simulator.py
```

## MCP Tools

The server exposes the following MCP tools:

- **`get_patient_vitals`**: Fetches the latest telemetry vitals for a patient
  - Input: `{ patient_id: string }`
  - Query: `SELECT * FROM telemetry_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 5`

- **`update_patient_status`**: Updates a patient's doctor brief and/or status
  - Input: `{ patient_id: string, doctor_brief?: string, status?: string }`
  - Query: `UPDATE patients SET doctor_brief = COALESCE($1, doctor_brief), status = COALESCE($2, status) WHERE id = $3`

## Team Setup

All team members can use the shared Neon.tech database:

1. Use the same `DATABASE_URL` in your `.env` file
2. Run `python telemetry_simulator/init_db.py` to set up the schema
3. Start the backend and frontend as described above

## Common Commands

```bash
# Backend
npm run build    # Build TypeScript to dist/
npm start        # Start MCP server (node dist/index.js)

# Frontend
cd frontend
npm run dev      # Start development server
npm run build    # Build for production