
import json
import time
import os

from patient import Patient
from vitals import VitalEngine
from ecg import ECGGenerator
from constants import *
from db_config import save_telemetry, update_patient_briefs
from ai_client import generate_ai_briefs

patient = Patient()

vitals = VitalEngine()

ecg = ECGGenerator()

patient.add_event("Patient Admitted")

patient.add_event("Monitoring Started")

last_condition = ""

# Database integration flag
DB_ENABLED = os.getenv('DB_ENABLED', 'true').lower() == 'true'

def doctor_alert(condition):

    if condition == CONDITION_BRADYCARDIA:

        patient.notify_doctor(

            "Bradycardia",

            "Heart Rate below 50 BPM. Immediate assessment required.",

            HIGH

        )

    elif condition == CONDITION_TACHYCARDIA:

        patient.notify_doctor(

            "Tachycardia",

            "Heart Rate above 120 BPM.",

            HIGH

        )

    elif condition == CONDITION_HYPOXIA:

        patient.notify_doctor(

            "Hypoxia",

            "SpO₂ below 90%. Oxygen therapy required.",

            HIGH

        )

    elif condition == CONDITION_FEVER:

        patient.notify_doctor(

            "High Fever",

            "Temperature above 39°C.",

            MEDIUM

        )

    elif condition == CONDITION_HYPOTENSION:

        patient.notify_doctor(

            "Hypotension",

            "Blood pressure critically low.",

            HIGH

        )

    elif condition == CONDITION_CARDIAC_ARREST:

        patient.notify_doctor(

            "CODE BLUE",

            "Cardiac Arrest Detected.",

            CRITICAL

        )


def nurse_alert(condition):

    if condition == CONDITION_BRADYCARDIA:

        patient.notify_nurse(

            "Bradycardia",

            [

                "Bring Crash Cart",

                "Prepare Atropine",

                "Continuous ECG",

                "Call Doctor"

            ]

        )

    elif condition == CONDITION_TACHYCARDIA:

        patient.notify_nurse(

            "Tachycardia",

            [

                "Provide Oxygen",

                "Monitor BP",

                "Attach ECG",

                "Notify Doctor"

            ]

        )

    elif condition == CONDITION_HYPOXIA:

        patient.notify_nurse(

            "Hypoxia",

            [

                "Administer Oxygen",

                "Check Airway",

                "Prepare Ventilator"

            ]

        )

    elif condition == CONDITION_FEVER:

        patient.notify_nurse(

            "High Fever",

            [

                "Measure Temperature",

                "Cooling Blanket",

                "Notify Doctor"

            ]

        )

    elif condition == CONDITION_HYPOTENSION:

        patient.notify_nurse(

            "Hypotension",

            [

                "Raise Legs",

                "IV Fluids",

                "Monitor BP"

            ]

        )

    elif condition == CONDITION_CARDIAC_ARREST:

        patient.notify_nurse(

            "CODE BLUE",

            [

                "Start CPR",

                "Prepare Defibrillator",

                "Call ICU Team"

            ]

        )


def save():

    with open("telemetry.json", "w") as f:

        json.dump(patient.to_dict(), f, indent=4)


def apply(condition):

    global last_condition

    if condition == CONDITION_STABLE:

        vitals.normal()

        patient.status = STATUS_NORMAL

        patient.color = COLORS[STATUS_NORMAL]

    elif condition == CONDITION_BRADYCARDIA:

        vitals.bradycardia()

        patient.status = STATUS_CRITICAL

        patient.color = COLORS[CONDITION_BRADYCARDIA]

    elif condition == CONDITION_TACHYCARDIA:

        vitals.tachycardia()

        patient.status = STATUS_CRITICAL

        patient.color = COLORS[CONDITION_TACHYCARDIA]

    elif condition == CONDITION_HYPOXIA:

        vitals.hypoxia()

        patient.status = STATUS_CRITICAL

        patient.color = COLORS[CONDITION_HYPOXIA]

    elif condition == CONDITION_FEVER:

        vitals.fever()

        patient.status = STATUS_WARNING

        patient.color = COLORS[CONDITION_FEVER]

    elif condition == CONDITION_HYPOTENSION:

        vitals.hypotension()

        patient.status = STATUS_CRITICAL

        patient.color = COLORS[CONDITION_HYPOTENSION]

    elif condition == CONDITION_CARDIAC_ARREST:

        vitals.cardiac_arrest()

        patient.status = STATUS_CRITICAL

        patient.color = COLORS[CONDITION_CARDIAC_ARREST]

    values = vitals.values()

    patient.heart_rate = values["heart_rate"]

    patient.spo2 = values["spo2"]

    patient.temperature = values["temperature"]

    patient.respiration = values["respiration"]

    patient.systolic_bp = values["blood_pressure"]["systolic"]

    patient.diastolic_bp = values["blood_pressure"]["diastolic"]

    patient.condition = condition

    patient.ecg = ecg.generate(condition)

    if last_condition != condition:

        patient.add_event(condition)

        patient.clear_alerts()

        doctor_alert(condition)

        nurse_alert(condition)

        last_condition = condition

    save()

    # Save to database if enabled
    if DB_ENABLED:
        is_critical = patient.status in [STATUS_CRITICAL, STATUS_WARNING]
        nurse_checklist = ''
        doctor_brief = ''

        if is_critical:
            # Generate AI briefs for critical conditions
            telemetry = {
                "heart_rate": patient.heart_rate,
                "spo2": patient.spo2,
                "temperature": patient.temperature,
                "systolic": patient.systolic_bp,
                "diastolic": patient.diastolic_bp,
                "ecg": patient.ecg
            }
            briefs = generate_ai_briefs(telemetry, condition)
            nurse_checklist = briefs["nurse_checklist"]
            doctor_brief = briefs["doctor_brief"]

        # Save telemetry to database
        blood_pressure = {
            "systolic": patient.systolic_bp,
            "diastolic": patient.diastolic_bp
        }
        result = save_telemetry(
            patient.patient_id,
            patient.heart_rate,
            patient.spo2,
            patient.temperature,
            blood_pressure,
            patient.status,
            patient.ecg,
            nurse_checklist,
            doctor_brief
        )

        if result:
            print("✓ Telemetry saved to database")
            if is_critical:
                # Update patient briefs
                update_patient_briefs(patient.patient_id, nurse_checklist, doctor_brief)
        else:
            print("✗ Failed to save telemetry to database")


print("=" * 60)
print(" ICU PATIENT GUARDIAN SIMULATOR ")
print("=" * 60)

while True:

    print("\n")

    print("1  Normal")

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

        print("Condition :", patient.condition)

        print("Status    :", patient.status)

        print("HeartRate :", patient.heart_rate)

        print("SpO₂      :", patient.spo2)

        print("Temp      :", patient.temperature)

        print("Resp      :", patient.respiration)

        print("BP        :", f"{patient.systolic_bp}/{patient.diastolic_bp}")

        print("ECG Points:", len(patient.ecg))

        print("-" * 60)

        time.sleep(1)

print("\nSimulation Stopped.")