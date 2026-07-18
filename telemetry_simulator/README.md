# ICU Telemetry Simulator

Generates simulated ICU patient telemetry for the Hospital Guardian system.

## Project Structure

```
telemetry_simulator/
├── simulator.py         # Main entry point - runs the interactive simulator
├── vitals.py            # VitalEngine class - generates vital signs for different conditions
├── ecg.py               # ECGGenerator class - generates ECG waveform data
├── constants.py         # Status/condition constants and color mappings
├── config.py            # Configuration dataclasses (PatientConfig, VitalRanges, etc.)
├── db_config.py         # PostgreSQL database integration
├── ai_client.py         # AI brief generation (nurse checklists, doctor briefs)
├── init_db.py           # Database schema initialization
├── test_db.py           # Database connection tests
└── requirements.txt     # Python dependencies
```

## Data Generated

- **Heart Rate** - BPM (varies by condition)
- **SpO2** - Oxygen saturation percentage
- **Temperature** - Body temperature in Celsius
- **Blood Pressure** - Systolic/Diastolic values
- **ECG** - Waveform data (250 samples/second)

## Database Integration

The simulator saves telemetry data directly to PostgreSQL database (Neon.tech).

### Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
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
- `AI_BASE_URL` - AI API endpoint (optional, for AI briefs)
- `AI_API_KEY` - AI API key (optional, falls back to templates)

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

1. Normal - Stable vital signs
2. Bradycardia - Heart rate below 50 BPM
3. Tachycardia - Heart rate above 120 BPM
4. Hypoxia - SpO2 below 90%
5. High Fever - Temperature above 39°C
6. Hypotension - Low blood pressure
7. Cardiac Arrest - No pulse/respiration

Select a scenario to simulate ICU patient telemetry with realistic vital signs and alerts.
