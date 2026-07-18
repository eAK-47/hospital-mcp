from dataclasses import dataclass

@dataclass
class PatientConfig:
    PATIENT_ID = "402"
    PATIENT_NAME = "John Doe"
    AGE = 45
    GENDER = "Male"

    ROOM = "ICU Bed 4"

    HISTORY = [
        "Hypertension",
        "Type-2 Diabetes"
    ]

    MEDICATIONS = [
        "Metoprolol",
        "Aspirin"
    ]
    ALLERGIES = [
        "Penicillin"
    ]


@dataclass
class SimulationConfig:

    UPDATE_INTERVAL = 1

    SAVE_JSON = True

    JSON_FILE = "telemetry.json"

    ENABLE_LOGS = True

    ENABLE_TIMELINE = True

    ENABLE_ALERTS = True

    ENABLE_DOCTOR_NOTIFICATION = True

    ENABLE_NURSE_NOTIFICATION = True

    AUTO_RECOVERY = False

    AUTO_DEATH = False

    DEATH_TIMEOUT = 120


@dataclass
class VitalRanges:

    HEART_RATE = (72,78)

    SPO2 = (97,99)

    RESPIRATION = (14,18)

    TEMPERATURE = (36.7,37.0)

    SYSTOLIC_BP = (118,122)

    DIASTOLIC_BP = (78,82)


@dataclass
class EmergencyThresholds:

    BRADYCARDIA = 50

    TACHYCARDIA = 120

    HYPOXIA = 90

    FEVER = 39

    HYPOTENSION = 90

    CARDIAC_ARREST = 0


@dataclass
class DashboardColors:

    NORMAL = "#2ECC71"

    WARNING = "#F1C40F"

    BRADYCARDIA = "#3498DB"

    TACHYCARDIA = "#E67E22"

    HYPOXIA = "#8E44AD"

    FEVER = "#FF8C00"

    HYPOTENSION = "#8B4513"

    CARDIAC_ARREST = "#E74C3C"

    DECEASED = "#000000"