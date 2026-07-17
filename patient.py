

from dataclasses import dataclass, field
from typing import List, Dict
from datetime import datetime

from config import PatientConfig
from constants import *


@dataclass
class Patient:

    patient_id: str = PatientConfig.PATIENT_ID
    name: str = PatientConfig.PATIENT_NAME
    age: int = PatientConfig.AGE
    gender: str = PatientConfig.GENDER
    room: str = PatientConfig.ROOM

    history: List[str] = field(default_factory=lambda: PatientConfig.HISTORY.copy())
    medications: List[str] = field(default_factory=lambda: PatientConfig.MEDICATIONS.copy())
    allergies: List[str] = field(default_factory=lambda: PatientConfig.ALLERGIES.copy())

   

    heart_rate: int = 76
    spo2: int = 98
    respiration: int = 16
    temperature: float = 36.8

    systolic_bp: int = 120
    diastolic_bp: int = 80

    ecg: List = field(default_factory=list)


    status: str = STATUS_NORMAL
    condition: str = CONDITION_STABLE
    color: str = COLORS[STATUS_NORMAL]



    alive: bool = True

    last_condition: str = ""

    emergency_start_time: str = ""


    doctor_alerts: List[Dict] = field(default_factory=list)
    nurse_alerts: List[Dict] = field(default_factory=list)

    

    timeline: List[Dict] = field(default_factory=list)

   

    event_history: List[str] = field(default_factory=list)



    last_updated: str = ""

    

    ai_analysis: Dict = field(default_factory=lambda: {
        "status": "Waiting for MCP",
        "summary": "",
        "confidence": 0
    })

   

    def update_timestamp(self):

        self.last_updated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    

    def add_event(self, event):

        self.timeline.append({

            "time": datetime.now().strftime("%H:%M:%S"),

            "event": event

        })

        self.event_history.append(event)



    def notify_doctor(self, title, message, priority):

        self.doctor_alerts.append({

            "timestamp": datetime.now().strftime("%H:%M:%S"),

            "priority": priority,

            "title": title,

            "message": message

        })


    def notify_nurse(self, title, checklist):

        self.nurse_alerts.append({

            "timestamp": datetime.now().strftime("%H:%M:%S"),

            "title": title,

            "actions": checklist

        })

   

    def clear_alerts(self):

        self.doctor_alerts.clear()
        self.nurse_alerts.clear()

   

    def declare_dead(self):

        self.alive = False

        self.status = STATUS_DECEASED

        self.condition = CONDITION_DECEASED

        self.color = COLORS[STATUS_DECEASED]

        self.add_event("Patient Declared Deceased")


    def recover(self):

        self.alive = True

        self.status = STATUS_NORMAL

        self.condition = CONDITION_RECOVERING

        self.color = COLORS[STATUS_NORMAL]

        self.add_event("Patient Recovered")

   

    def to_dict(self):

        self.update_timestamp()

        return {

            "patient": {

                "id": self.patient_id,

                "name": self.name,

                "age": self.age,

                "gender": self.gender,

                "room": self.room,

                "history": self.history,

                "medications": self.medications,

                "allergies": self.allergies

            },

            "status": {

                "state": self.status,

                "condition": self.condition,

                "color": self.color,

                "alive": self.alive

            },

            "vitals": {

                "heart_rate": self.heart_rate,

                "spo2": self.spo2,

                "temperature": self.temperature,

                "respiration": self.respiration,

                "blood_pressure": {

                    "systolic": self.systolic_bp,

                    "diastolic": self.diastolic_bp

                }

            },

            "ecg": self.ecg,

            "doctor_alerts": self.doctor_alerts,

            "nurse_alerts": self.nurse_alerts,

            "timeline": self.timeline,

            "ai_analysis": self.ai_analysis,

            "simulation": {

                "generated_by": "Member 2",

                "version": "1.0"

            },

            "last_updated": self.last_updated

        }