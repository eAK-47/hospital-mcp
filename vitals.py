"""
vitals.py
---------------------------------------
Generates realistic ICU vital signs
---------------------------------------
"""

import random

from config import VitalRanges


class VitalEngine:

    def __init__(self):

        self.hr = random.randint(*VitalRanges.HEART_RATE)

        self.spo2 = random.randint(*VitalRanges.SPO2)

        self.temp = round(random.uniform(*VitalRanges.TEMPERATURE), 1)

        self.resp = random.randint(*VitalRanges.RESPIRATION)

        self.sys = random.randint(*VitalRanges.SYSTOLIC_BP)

        self.dia = random.randint(*VitalRanges.DIASTOLIC_BP)

    # ---------------------------------

    # Smooth movement

    # ---------------------------------

    def smooth(self, current, target, step):

        if current < target:
            current += step

            if current > target:
                current = target

        elif current > target:

            current -= step

            if current < target:
                current = target

        return current

    # ---------------------------------

    # NORMAL

    # ---------------------------------

    def normal(self):

        self.hr = self.smooth(
            self.hr,
            random.randint(72, 78),
            1
        )

        self.spo2 = self.smooth(
            self.spo2,
            random.randint(97, 99),
            1
        )

        self.temp = round(

            self.smooth(

                self.temp,

                random.uniform(36.7, 37.0),

                0.1

            ),

            1

        )

        self.resp = self.smooth(
            self.resp,
            random.randint(14, 18),
            1
        )

        self.sys = self.smooth(
            self.sys,
            random.randint(118, 122),
            1
        )

        self.dia = self.smooth(
            self.dia,
            random.randint(78, 82),
            1
        )

    # ---------------------------------

    # BRADYCARDIA

    # ---------------------------------

    def bradycardia(self):

        self.hr = self.smooth(self.hr, 42, 2)

        self.spo2 = self.smooth(self.spo2, 86, 1)

        self.temp = round(

            self.smooth(self.temp, 37.5, 0.1),

            1

        )

        self.resp = self.smooth(self.resp, 10, 1)

        self.sys = self.smooth(self.sys, 82, 2)

        self.dia = self.smooth(self.dia, 55, 2)

    # ---------------------------------

    # TACHYCARDIA

    # ---------------------------------

    def tachycardia(self):

        self.hr = self.smooth(self.hr, 138, 3)

        self.spo2 = self.smooth(self.spo2, 93, 1)

        self.temp = round(

            self.smooth(self.temp, 38.2, 0.1),

            1

        )

        self.resp = self.smooth(self.resp, 28, 1)

        self.sys = self.smooth(self.sys, 150, 2)

        self.dia = self.smooth(self.dia, 95, 2)

    # ---------------------------------

    # HYPOXIA

    # ---------------------------------

    def hypoxia(self):

        self.hr = self.smooth(self.hr, 118, 2)

        self.spo2 = self.smooth(self.spo2, 82, 2)

        self.temp = round(

            self.smooth(self.temp, 37.4, 0.1),

            1

        )

        self.resp = self.smooth(self.resp, 30, 1)

    # ---------------------------------

    # FEVER

    # ---------------------------------

    def fever(self):

        self.temp = round(

            self.smooth(self.temp, 39.4, 0.1),

            1

        )

        self.hr = self.smooth(self.hr, 102, 1)

    # ---------------------------------

    # HYPOTENSION

    # ---------------------------------

    def hypotension(self):

        self.sys = self.smooth(self.sys, 80, 2)

        self.dia = self.smooth(self.dia, 50, 2)

        self.hr = self.smooth(self.hr, 115, 2)

    # ---------------------------------

    # CARDIAC ARREST

    # ---------------------------------

    def cardiac_arrest(self):

        self.hr = self.smooth(self.hr, 0, 5)

        self.spo2 = self.smooth(self.spo2, 60, 2)

        self.temp = round(

            self.smooth(self.temp, 35.5, 0.1),

            1

        )

        self.resp = self.smooth(self.resp, 0, 2)

        self.sys = self.smooth(self.sys, 0, 5)

        self.dia = self.smooth(self.dia, 0, 5)

    # ---------------------------------

    # Return Current Values

    # ---------------------------------

    def values(self):

        return {

            "heart_rate": int(self.hr),

            "spo2": int(self.spo2),

            "temperature": round(self.temp, 1),

            "respiration": int(self.resp),

            "blood_pressure": {

                "systolic": int(self.sys),

                "diastolic": int(self.dia)

            }

        }