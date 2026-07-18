import json
import time
import os
import sys

# Automatically handle directory path routing
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from vitals import VitalEngine
from ecg import ECGGenerator
from constants import *
from db_config import save_telemetry, update_patient_briefs
from ai_client import generate_ai_briefs

# Define a baseline state dictionary to replace the Patient class object
patient_state = {
    "patient_id": "402",  # Default baseline patient ID
    "status": STATUS_NORMAL,
    "condition": CONDITION_STABLE,
    "color": COLORS.get(STATUS_NORMAL, "green"),
    "heart_rate": 70,
    "spo2": 98,
    "temperature": 36.8,
    "respiration": 16,
    "systolic_bp": 120,
    "diastolic_bp": 80,
    "ecg": [],
    "events": ["Patient Admitted", "Monitoring Started"],
    "alerts": []
}

vitals = VitalEngine()
ecg = ECGGenerator()
last_condition = ""

# Database integration flag
DB_ENABLED = os.getenv('DB_ENABLED', 'true').lower() == 'true'

def add_event(event_text):
    patient_state["events"].append(event_text)

def notify_doctor(alert_type, details, priority):
    alert = {"type": f"DOCTOR: {alert_type}", "message": details, "priority": priority}
    patient_state["alerts"].append(alert)

def notify_nurse(alert_type, tasks):
    alert = {"type": f"NURSE: {alert_type}", "tasks": tasks}
    patient_state["alerts"].append(alert)

def doctor_alert(condition):
    if condition == CONDITION_BRADYCARDIA:
        notify_doctor("Bradycardia", "Heart Rate below 50 BPM. Immediate assessment required.", HIGH)
    elif condition == CONDITION_TACHYCARDIA:
        notify_doctor("Tachycardia", "Heart Rate above 120 BPM.", HIGH)
    elif condition == CONDITION_HYPOXIA:
        notify_doctor("Hypoxia", "SpO₂ below 90%. Oxygen therapy required.", HIGH)
    elif condition == CONDITION_FEVER:
        notify_doctor("High Fever", "Temperature above 39°C.", MEDIUM)
    elif condition == CONDITION_HYPOTENSION:
        notify_doctor("Hypotension", "Blood pressure critically low.", HIGH)
    elif condition == CONDITION_CARDIAC_ARREST:
        notify_doctor("CODE BLUE", "Cardiac Arrest Detected.", CRITICAL)

def nurse_alert(condition):
    if condition == CONDITION_BRADYCARDIA:
        notify_nurse("Bradycardia", ["Bring Crash Cart", "Prepare Atropine", "Continuous ECG", "Call Doctor"])
    elif condition == CONDITION_TACHYCARDIA:
        notify_nurse("Tachycardia", ["Provide Oxygen", "Monitor BP", "Attach ECG", "Notify Doctor"])
    elif condition == CONDITION_HYPOXIA:
        notify_nurse("Hypoxia", ["Administer Oxygen", "Check Airway", "Prepare Ventilator"])
    elif condition == CONDITION_FEVER:
        notify_nurse("High Fever", ["Measure Temperature", "Cooling Blanket", "Notify Doctor"])
    elif condition == CONDITION_HYPOTENSION:
        notify_nurse("Hypotension", ["Raise Legs", "IV Fluids", "Monitor BP"])
    elif condition == CONDITION_CARDIAC_ARREST:
        notify_nurse("CODE BLUE", ["Start CPR", "Prepare Defibrillator", "Call ICU Team"])

def save_local_json():
    with open("telemetry.json", "w") as f:
        json.dump(patient_state, f, indent=4)

def apply(condition):
    global last_condition

    if condition == CONDITION_STABLE:
        vitals.normal()
        patient_state["status"] = STATUS_NORMAL
        patient_state["color"] = COLORS.get(STATUS_NORMAL, "green")
    elif condition in [CONDITION_BRADYCARDIA, CONDITION_TACHYCARDIA, CONDITION_HYPOXIA, CONDITION_HYPOTENSION, CONDITION_CARDIAC_ARREST]:
        if condition == CONDITION_BRADYCARDIA:
            vitals.bradycardia()
        elif condition == CONDITION_TACHYCARDIA:
            vitals.tachycardia()
        elif condition == CONDITION_HYPOXIA:
            vitals.hypoxia()
        elif condition == CONDITION_HYPOTENSION:
            vitals.hypotension()
        elif condition == CONDITION_CARDIAC_ARREST:
            vitals.cardiac_arrest()
        patient_state["status"] = STATUS_CRITICAL
        patient_state["color"] = COLORS.get(condition, "red")
    elif condition == CONDITION_FEVER:
        vitals.fever()
        patient_state["status"] = STATUS_WARNING
        patient_state["color"] = COLORS.get(CONDITION_FEVER, "yellow")

    values = vitals.values()
    patient_state["heart_rate"] = values["heart_rate"]
    patient_state["spo2"] = values["spo2"]
    patient_state["temperature"] = values["temperature"]
    patient_state["respiration"] = values["respiration"]
    patient_state["systolic_bp"] = values["blood_pressure"]["systolic"]
    patient_state["diastolic_bp"] = values["blood_pressure"]["diastolic"]
    patient_state["condition"] = condition
    patient_state["ecg"] = ecg.generate(condition)

    if last_condition != condition:
        add_event(condition)
        patient_state["alerts"] = []  # Clear previous alerts
        doctor_alert(condition)
        nurse_alert(condition)
        last_condition = condition

    save_local_json()

    # Database integration block
    if DB_ENABLED:
        is_critical = patient_state["status"] in [STATUS_CRITICAL, STATUS_WARNING]
        nurse_checklist = ''
        doctor_brief = ''

        if is_critical:
            telemetry = {
                "heart_rate": patient_state["heart_rate"],
                "spo2": patient_state["spo2"],
                "temperature": patient_state["temperature"],
                "systolic": patient_state["systolic_bp"],
                "diastolic": patient_state["diastolic_bp"],
                "ecg": patient_state["ecg"]
            }
            try:
                briefs = generate_ai_briefs(telemetry, condition)
                nurse_checklist = briefs["nurse_checklist"]
                doctor_brief = briefs["doctor_brief"]
            except Exception as e:
                print(f"⚠️ AI Generation skipped/failed: {e}")

        blood_pressure = {
            "systolic": patient_state["systolic_bp"],
            "diastolic": patient_state["diastolic_bp"]
        }
        
        result = save_telemetry(
            patient_state["patient_id"],
            patient_state["heart_rate"],
            patient_state["spo2"],
            patient_state["temperature"],
            blood_pressure,
            patient_state["status"],
            patient_state["ecg"],
            nurse_checklist,
            doctor_brief
        )

        if result:
            print("✓ Telemetry saved to database")
            if is_critical:
                update_patient_briefs(patient_state["patient_id"], nurse_checklist, doctor_brief)
        else:
            print("✗ Failed to save telemetry to database")

print("=" * 60)
print(" ICU PATIENT GUARDIAN SIMULATOR (COMPACT MODE) ")
print("=" * 60)

while True:
    print("\n1  Normal")
    print("2  Bradycardia")
    print("3  Tachycardia")
    print("4  Hypoxia")
    print("5  High Fever")
    print("6  Hypotension")
    print("7  Cardiac Arrest")
    print("0  Exit")

    choice = input("\nSelect Scenario : ")

    if choice == "0":
        break
    elif choice == "1":
        mode = CONDITION_STABLE
    elif choice == "2":
        mode = CONDITION_BRADYCARDIA
    elif choice == "3":
        mode = CONDITION_TACHYCARDIA
    elif choice == "4":
        mode = CONDITION_HYPOXIA
    elif choice == "5":
        mode = CONDITION_FEVER
    elif choice == "6":
        mode = CONDITION_HYPOTENSION
    elif choice == "7":
        mode = CONDITION_CARDIAC_ARREST
    else:
        print("Invalid Option")
        continue

    print("\nRunning Simulation...\n")
    for i in range(15):
        apply(mode)
        print("-" * 60)
        print("Condition :", patient_state["condition"])
        print("Status    :", patient_state["status"])
        print("HeartRate :", patient_state["heart_rate"])
        print("SpO₂      :", patient_state["spo2"])
        print("Temp      :", patient_state["temperature"])
        print("Resp      :", patient_state["respiration"])
        print("BP        :", f"{patient_state['systolic_bp']}/{patient_state['diastolic_bp']}")
        print("ECG Points:", len(patient_state["ecg"]))
        print("-" * 60)
        time.sleep(1)

print("\nSimulation Stopped.")