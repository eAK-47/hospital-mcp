"""
ecg.py
---------------------------------------
ECG Waveform Generator
ICU Patient Guardian
---------------------------------------
"""

import math
import random


class ECGGenerator:

    def __init__(self):

        self.time = 0

        self.step = 0.02


    def pulse(self, x, center, width, height):

        return height * math.exp(-((x-center)**2)/(2*width**2))


    def normal(self):

        points = []

        x = 0

        while x <= 1:

            y = 0

            # P Wave
            y += self.pulse(x,0.18,0.025,0.15)

            # Q Wave
            y += self.pulse(x,0.39,0.008,-0.15)

            # R Wave
            y += self.pulse(x,0.40,0.006,1.30)

            # S Wave
            y += self.pulse(x,0.42,0.010,-0.25)

            # T Wave
            y += self.pulse(x,0.70,0.050,0.35)

            y += random.uniform(-0.015,0.015)

            points.append({

                "t": round(x,3),

                "v": round(y,3)

            })

            x += self.step

        return points

   
    def bradycardia(self):

        waveform = self.normal()

        for p in waveform:

            p["t"] = round(p["t"]*1.8,3)

        return waveform



    def tachycardia(self):

        waveform = self.normal()

        for p in waveform:

            p["t"] = round(p["t"]*0.6,3)

        return waveform



    def hypoxia(self):

        waveform = self.normal()

        for p in waveform:

            p["v"] += random.uniform(-0.15,0.15)

        return waveform

   

    def fever(self):

        waveform = self.normal()

        for p in waveform:

            p["v"] *= 0.95

        return waveform

    

    def hypotension(self):

        waveform = self.normal()

        for p in waveform:

            p["v"] *= 0.8

        return waveform

   

    def cardiac_arrest(self):

        waveform = []

        x = 0

        while x <= 1:

            waveform.append({

                "t": round(x,3),

                "v": random.uniform(-0.01,0.01)

            })

            x += self.step

        return waveform

    

    def recovery(self):

        return self.normal()



    def generate(self, condition):

        if condition == "Bradycardia":
            return self.bradycardia()

        elif condition == "Tachycardia":
            return self.tachycardia()

        elif condition == "Hypoxia":
            return self.hypoxia()

        elif condition == "High Fever":
            return self.fever()

        elif condition == "Hypotension":
            return self.hypotension()

        elif condition == "Cardiac Arrest":
            return self.cardiac_arrest()

        else:
            return self.normal()