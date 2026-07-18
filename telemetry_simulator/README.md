# ICU Telemetry Simulator

Generates simulated ICU patient telemetry.

## Data Generated

- Heart Rate
- SpO2
- Temperature
- Blood Pressure
- ECG

## Database Integration

The simulator saves telemetry data directly to PostgreSQL database (Neon.tech).

### Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirments.txt
   ```

2. Initialize the database schema:
   ```bash
   python init_db.py
   ```

3. Run the simulator:
   ```bash
   python simulator.py
   ```

### Configuration

- `DB_ENABLED=true` - Enable/disable database integration (default: true)
- `DATABASE_URL` - PostgreSQL connection string (configured for Neon.tech)

### Database Schema

The simulator writes to:
- `telemetry_logs` table - Stores each telemetry reading
- `patients` table - Updates patient status and condition

### Features

- **Real-time telemetry**: Updates every second
- **AI Briefs**: Generates nurse checklists and doctor briefs for critical conditions
- **JSON output**: Also saves to `telemetry.json` for local inspection
- **Team collaboration**: Uses shared Neon.tech database

### Team Setup

All team members can use the same database by:
1. Copying `.env.example` to `.env`
2. Using the shared Neon.tech connection string
3. Running `python init_db.py` once to set up the schema

### Scenarios

1. Normal
2. Bradycardia
3. Tachycardia
4. Hypoxia
5. High Fever
6. Hypotension
7. Cardiac Arrest

Select a scenario to simulate ICU patient telemetry with realistic vital signs and alerts.