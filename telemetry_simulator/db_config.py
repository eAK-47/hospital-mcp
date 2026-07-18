"""
db_config.py
---------------------------------------
PostgreSQL Database Configuration
---------------------------------------
"""

import os
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv

# Load environment variables from parent .env file
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

DATABASE_URL = os.getenv('DATABASE_URL')

def get_db_connection():
    """Create and return a database connection."""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable not set")
    
    # Parse connection string for better error handling
    try:
        # For Neon.tech, we need to handle SSL properly
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        print(f"DATABASE_URL: {DATABASE_URL[:50]}..." if DATABASE_URL else "No DATABASE_URL set")
        raise

def save_telemetry(patient_id, heart_rate, spo2, temperature, blood_pressure, status, ecg=None, nurse_checklist='', doctor_brief=''):
    """
    Save telemetry data to the database.
    
    Args:
        patient_id: Patient identifier
        heart_rate: Heart rate in BPM
        spo2: Oxygen saturation percentage
        temperature: Body temperature in Celsius
        blood_pressure: Dict with systolic and diastolic values
        status: Patient status (NORMAL, WARNING, CRITICAL)
        ecg: Optional ECG waveform data
        nurse_checklist: AI-generated nurse checklist (for critical conditions)
        doctor_brief: AI-generated doctor brief (for critical conditions)
    """
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Insert into telemetry_logs table
        cur.execute(
            """
            INSERT INTO telemetry_logs 
            (patient_id, heart_rate, spo2, temperature, blood_pressure, status, nurse_checklist, doctor_brief)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                patient_id,
                heart_rate,
                spo2,
                temperature,
                Json(blood_pressure),
                status,
                nurse_checklist,
                doctor_brief
            )
        )
        
        inserted_log = cur.fetchone()
        
        # Update patient status
        cur.execute(
            "UPDATE patients SET status = %s, condition = %s WHERE id = %s",
            (status, status, patient_id)
        )
        
        conn.commit()
        cur.close()
        
        return inserted_log
        
    except Exception as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()

def update_patient_briefs(patient_id, nurse_checklist, doctor_brief):
    """
    Update patient table with AI-generated briefs.
    
    Args:
        patient_id: Patient identifier
        nurse_checklist: AI-generated nurse checklist
        doctor_brief: AI-generated doctor brief
    """
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "UPDATE patients SET nurse_checklist = %s, doctor_brief = %s WHERE id = %s",
            (nurse_checklist, doctor_brief, patient_id)
        )
        
        conn.commit()
        cur.close()
        
        return True
        
    except Exception as e:
        print(f"Database error updating briefs: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()