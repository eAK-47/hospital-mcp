"""
Test database connection
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from db_config import get_db_connection, save_telemetry, DATABASE_URL

print(f"DATABASE_URL: {DATABASE_URL}")

try:
    conn = get_db_connection()
    print("✓ Database connection successful!")
    
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM patients")
    count = cur.fetchone()
    print(f"Patients in database: {count}")
    
    # Test insert
    result = save_telemetry(
        "402",
        75,
        98,
        36.8,
        {"systolic": 120, "diastolic": 80},
        "NORMAL"
    )
    print(f"Test insert result: {result}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    print("\nNote: The database might not be accessible from this environment.")
    print("The simulator will still work and save to telemetry.json file.")