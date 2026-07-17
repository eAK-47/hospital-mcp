

from constants import *


class EventEngine:

    def __init__(self, patient, vitals):

        self.patient = patient
        self.vitals = vitals

    

    def update_patient(self):

        values = self.vitals.values()

        self.patient.heart_rate = values["heart_rate"]
        self.patient.spo2 = values["spo2"]
        self.patient.temperature = values["temperature"]
        self.patient.respiration = values["respiration"]

        self.patient.systolic_bp = values["blood_pressure"]["systolic"]
        self.patient.diastolic_bp = values["blood_pressure"]["diastolic"]

  

    def normal(self):

        self.vitals.normal()

        self.update_patient()

        self.patient.status = STATUS_NORMAL
        self.patient.condition = CONDITION_STABLE
        self.patient.color = COLORS[STATUS_NORMAL]



    def bradycardia(self):

        self.vitals.bradycardia()

        self.update_patient()

        self.patient.status = STATUS_CRITICAL
        self.patient.condition = CONDITION_BRADYCARDIA
        self.patient.color = COLORS[CONDITION_BRADYCARDIA]

        self.patient.add_event("Bradycardia detected")

        self.patient.notify_doctor(

            AI_MESSAGES[CONDITION_BRADYCARDIA]["title"],

            AI_MESSAGES[CONDITION_BRADYCARDIA]["message"],

            AI_MESSAGES[CONDITION_BRADYCARDIA]["priority"]

        )

        self.patient.notify_nurse(

            "Bradycardia",

            NURSE_ACTIONS[CONDITION_BRADYCARDIA]

        )

    

    def tachycardia(self):

        self.vitals.tachycardia()

        self.update_patient()

        self.patient.status = STATUS_CRITICAL
        self.patient.condition = CONDITION_TACHYCARDIA
        self.patient.color = COLORS[CONDITION_TACHYCARDIA]

        self.patient.add_event("Tachycardia detected")

        self.patient.notify_doctor(

            AI_MESSAGES[CONDITION_TACHYCARDIA]["title"],

            AI_MESSAGES[CONDITION_TACHYCARDIA]["message"],

            AI_MESSAGES[CONDITION_TACHYCARDIA]["priority"]

        )

        self.patient.notify_nurse(

            "Tachycardia",

            NURSE_ACTIONS[CONDITION_TACHYCARDIA]

        )

    

    def hypoxia(self):

        self.vitals.hypoxia()

        self.update_patient()

        self.patient.status = STATUS_CRITICAL
        self.patient.condition = CONDITION_HYPOXIA
        self.patient.color = COLORS[CONDITION_HYPOXIA]

        self.patient.add_event("Hypoxia detected")

        self.patient.notify_doctor(

            AI_MESSAGES[CONDITION_HYPOXIA]["title"],

            AI_MESSAGES[CONDITION_HYPOXIA]["message"],

            AI_MESSAGES[CONDITION_HYPOXIA]["priority"]

        )

        self.patient.notify_nurse(

            "Hypoxia",

            NURSE_ACTIONS[CONDITION_HYPOXIA]

        )

    

    def fever(self):

        self.vitals.fever()

        self.update_patient()

        self.patient.status = STATUS_WARNING
        self.patient.condition = CONDITION_FEVER
        self.patient.color = COLORS[CONDITION_FEVER]

        self.patient.add_event("High fever detected")

        self.patient.notify_doctor(

            AI_MESSAGES[CONDITION_FEVER]["title"],

            AI_MESSAGES[CONDITION_FEVER]["message"],

            AI_MESSAGES[CONDITION_FEVER]["priority"]

        )

        self.patient.notify_nurse(

            "High Fever",

            NURSE_ACTIONS[CONDITION_FEVER]

        )

    

    def hypotension(self):

        self.vitals.hypotension()

        self.update_patient()

        self.patient.status = STATUS_CRITICAL
        self.patient.condition = CONDITION_HYPOTENSION
        self.patient.color = COLORS[CONDITION_HYPOTENSION]

        self.patient.add_event("Hypotension detected")

        self.patient.notify_doctor(

            AI_MESSAGES[CONDITION_HYPOTENSION]["title"],

            AI_MESSAGES[CONDITION_HYPOTENSION]["message"],

            AI_MESSAGES[CONDITION_HYPOTENSION]["priority"]

        )

        self.patient.notify_nurse(

            "Hypotension",

            NURSE_ACTIONS[CONDITION_HYPOTENSION]

        )

   
    def cardiac_arrest(self):

        self.vitals.cardiac_arrest()

        self.update_patient()

        self.patient.status = STATUS_CRITICAL
        self.patient.condition = CONDITION_CARDIAC_ARREST
        self.patient.color = COLORS[CONDITION_CARDIAC_ARREST]

        self.patient.add_event("🚨 CODE BLUE")

        self.patient.notify_doctor(

            AI_MESSAGES[CONDITION_CARDIAC_ARREST]["title"],

            AI_MESSAGES[CONDITION_CARDIAC_ARREST]["message"],

            AI_MESSAGES[CONDITION_CARDIAC_ARREST]["priority"]

        )

        self.patient.notify_nurse(

            "CODE BLUE",

            NURSE_ACTIONS[CONDITION_CARDIAC_ARREST]

        )

  

    def deceased(self):

        self.patient.status = STATUS_DECEASED
        self.patient.condition = CONDITION_DECEASED
        self.patient.color = COLORS[STATUS_DECEASED]

        self.patient.add_event("Patient declared deceased")

   

    def recovery(self):

        self.vitals.normal()

        self.update_patient()

        self.patient.status = STATUS_NORMAL
        self.patient.condition = CONDITION_RECOVERING
        self.patient.color = COLORS[STATUS_NORMAL]

        self.patient.add_event("Patient recovering")