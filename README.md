# Hospital Guardian MCP Server

ICU Patient Monitoring System with AI-powered medical briefs and real-time telemetry.

## Features

- **MCP Server**: Provides tools and resources for patient monitoring
- **HTTP API**: REST endpoints for frontend integration
- **Telemetry Simulator**: Python-based simulator for testing
- **Frontend**: React + TypeScript + Vite dashboard

## Project Structure

```
├── src/                    # MCP Server (TypeScript)
│   ├── modules/             # MCP modules
│   │   └── hospital-guardian/ # Patient monitoring module
│   │       ├── hospital-guardian.tools.ts
│   │       └── hospital-guardian.resources.ts
│   ├── http-api.ts          # HTTP API server
│   ├── db.ts                # PostgreSQL connection
│   ├── ai.service.ts        # AI integration service
│   └── index.ts             # Server entry point
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
# NitroStack Configuration
NITRO_LOG_LEVEL=info
NITROSTACK_APP_MODE=openai
MCP_TRANSPORT_TYPE=dual

# Server Configuration
PORT=3000
HOST=0.0.0.0

# PostgreSQL Database Configuration (Neon.tech)
DATABASE_URL=postgresql://neondb_owner:npg_mwEK7S9kiOPz@ep-little-meadow-awdnjdk6.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require

# Telemetry Simulator Configuration
DB_ENABLED=true

# AI Provider Configuration (Gemini)
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.0-flash
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
# Terminal 1: Start Backend (MCP + HTTP API)
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 4. Run Telemetry Simulator (Optional)

```bash
python telemetry_simulator/simulator.py
```

## API Endpoints

- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients/priority` - Get priority patient
- `GET /api/history` - Get telemetry history
- `GET /api/checklist` - Get nurse checklist
- `GET /api/notifications` - Get notifications
- `GET /api/connections` - Get connection status
- `POST /api/telemetry` - Update telemetry data

## Team Setup

All team members can use the shared Neon.tech database:

1. Use the same `DATABASE_URL` in your `.env` file
2. Run `python telemetry_simulator/init_db.py` to set up the schema
3. Start the backend and frontend as described above

## Common Commands

```bash
# Backend
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server

# Frontend
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
```

## Links

- Docs: <https://docs.nitrostack.ai>
- NitroStudio: <https://nitrostack.ai/studio>