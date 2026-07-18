"""
vitals.py
---------------------------------------
Vital signs engine for generating simulated patient vitals.
"""

import random
from config import VitalRanges, EmergencyThresholds


class VitalEngine:
    def __init__(self):
        self.heart_rate = 75
        self.spo2 = 98
        self.temperature = 36.8
        self.respiration = 16
        self.systolic_bp = 120
        self.diastolic_bp = 80
    
    def values(self):
        """Return current vital values as a dictionary."""
        return {
            "heart_rate": self.heart_rate,
            "spo2": self.spo2,
            "temperature": self.temperature,
            "respiration": self.respiration,
            "blood_pressure": {
                "systolic": self.systolic_bp,
                "diastolic": self.diastolic_bp
            }
        }
    
    def _random_range(self, base, variance):
        """Generate a random value within a range around base."""
        return base + random.randint(-variance, variance)
    
    def normal(self):
        """Set vitals to normal range."""
        self.heart_rate = self._random_range(75, 5)
        self.spo2 = self._random_range(98, 1)
        self.temperature = round(random.uniform(36.7, 37.0), 1)
        self.respiration = self._random_range(16, 2)
        self.systolic_bp = self._random_range(120, 5)
        self.diastolic_bp = self._random_range(80, 5)
    
    def bradycardia(self):
        """Set vitals for bradycardia condition (HR < 50)."""
        self.heart_rate = random.randint(35, 49)
        self.spo2 = self._random_range(95, 3)
        self.temperature = round(random.uniform(36.5, 37.5), 1)
        self.respiration = self._random_range(14, 3)
        self.systolic_bp = self._random_range(100, 15)
        self.diastolic_bp = self._random_range(65, 10)
    
    def tachycardia(self):
        """Set vitals for tachycardia condition (HR > 120)."""
        self.heart_rate = random.randint(121, 160)
        self.spo2 = self._random_range(94, 4)
        self.temperature = round(random.uniform(37.0, 38.5), 1)
        self.respiration = self._random_range(20, 5)
        self.systolic_bp = self._random_range(130, 20)
        self.diastolic_bp = self._random_range(85, 15)
    
    def hypoxia(self):
        """Set vitals for hypoxia condition (SpO2 < 90)."""
        self.heart_rate = self._random_range(100, 15)
        self.spo2 = random.randint(80, 89)
        self.temperature = round(random.uniform(36.5, 38.0), 1)
        self.respiration = self._random_range(22, 6)
        self.systolic_bp = self._random_range(110, 20)
        self.diastolic_bp = self._random_range(70, 15)
    
    def fever(self):
        """Set vitals for fever condition (Temp > 39)."""
        self.heart_rate = self._random_range(100, 15)
        self.spo2 = self._random_range(97, 2)
        self.temperature = round(random.uniform(39.1, 40.5), 1)
        self.respiration = self._random_range(20, 4)
        self.systolic_bp = self._random_range(115, 15)
        self.diastolic_bp = self._random_range(75, 10)
    
    def hypotension(self):
        """Set vitals for hypotension condition (BP low)."""
        self.heart_rate = self._random_range(90, 15)
        self.spo2 = self._random_range(95, 3)
        self.temperature = round(random.uniform(36.5, 37.5), 1)
        self.respiration = self._random_range(16, 3)
        self.systolic_bp = random.randint(60, 89)
        self.diastolic_bp = random.randint(40, 59)
    
    def cardiac_arrest(self):
        """Set vitals for cardiac arrest condition."""
        self.heart_rate = 0
        self.spo2 = random.randint(20, 40)
        self.temperature = round(random.uniform(36.0, 37.0), 1)
        self.respiration = 0
        self.systolic_bp = random.randint(30, 50)
        self.diastolic_bp = random.randint(20, 35)