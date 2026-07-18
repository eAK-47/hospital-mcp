"""
ecg.py
---------------------------------------
ECG waveform generator for simulating heart rhythms.
"""

import random
import math


class ECGGenerator:
    def __init__(self):
        self.sample_rate = 250  # samples per second
        self.duration = 2  # seconds
    
    def generate(self, condition="Stable"):
        """
        Generate ECG waveform data based on condition.
        
        Args:
            condition: The patient condition (affects waveform pattern)
            
        Returns:
            List of ECG values representing the waveform
        """
        num_points = self.sample_rate * self.duration
        ecg_data = []
        
        if condition == "Stable":
            ecg_data = self._generate_normal(num_points)
        elif condition == "Bradycardia":
            ecg_data = self._generate_bradycardia(num_points)
        elif condition == "Tachycardia":
            ecg_data = self._generate_tachycardia(num_points)
        elif condition == "Hypoxia":
            ecg_data = self._generate_hypoxia(num_points)
        elif condition == "High Fever":
            ecg_data = self._generate_fever(num_points)
        elif condition == "Hypotension":
            ecg_data = self._generate_hypotension(num_points)
        elif condition == "Cardiac Arrest":
            ecg_data = self._generate_cardiac_arrest(num_points)
        else:
            ecg_data = self._generate_normal(num_points)
        
        return ecg_data
    
    def _generate_normal(self, num_points):
        """Generate normal sinus rhythm ECG."""
        ecg = []
        for i in range(num_points):
            t = i / self.sample_rate
            # Normal sinus rhythm: P wave, QRS complex, T wave
            # Simplified model
            value = 0
            # P wave (atrial depolarization)
            if 0.01 < (t % 0.8) < 0.03:
                value += 0.1 * math.sin((t % 0.8) * 100)
            # QRS complex (ventricular depolarization)
            if 0.03 < (t % 0.8) < 0.04:
                value += 1.0 * math.sin((t % 0.8) * 200)
            # T wave (ventricular repolarization)
            if 0.04 < (t % 0.8) < 0.06:
                value += 0.3 * math.sin((t % 0.8) * 150)
            # Add baseline noise
            value += random.uniform(-0.02, 0.02)
            ecg.append(round(value, 4))
        return ecg
    
    def _generate_bradycardia(self, num_points):
        """Generate bradycardia ECG (slow heart rate)."""
        ecg = []
        for i in range(num_points):
            t = i / self.sample_rate
            # Slower rhythm
            value = 0
            if 0.01 < (t % 1.2) < 0.03:
                value += 0.1 * math.sin((t % 1.2) * 100)
            if 0.03 < (t % 1.2) < 0.04:
                value += 1.0 * math.sin((t % 1.2) * 200)
            if 0.04 < (t % 1.2) < 0.06:
                value += 0.3 * math.sin((t % 1.2) * 150)
            value += random.uniform(-0.03, 0.03)
            ecg.append(round(value, 4))
        return ecg
  
    def _generate_tachycardia(self, num_points):
        """Generate tachycardia ECG (fast heart rate)."""
        ecg = []
        for i in range(num_points):
            t = i / self.sample_rate
            # Faster rhythm
            value = 0
            if 0.01 < (t % 0.4) < 0.02:
                value += 0.1 * math.sin((t % 0.4) * 150)
            if 0.02 < (t % 0.4) < 0.025:
                value += 1.0 * math.sin((t % 0.4) * 300)
            if 0.025 < (t % 0.4) < 0.035:
                value += 0.3 * math.sin((t % 0.4) * 200)
            value += random.uniform(-0.04, 0.04)
            ecg.append(round(value, 4))
        return ecg
    
    def _generate_hypoxia(self, num_points):
        """Generate hypoxia ECG (irregular pattern)."""
        ecg = []
        for i in range(num_points):
            t = i / self.sample_rate
            value = 0
            # Irregular pattern due to hypoxia
            if 0.01 < (t % 0.6) < 0.025:
                value += 0.1 * math.sin((t % 0.6) * 100)
            if 0.025 < (t % 0.6) < 0.035:
                value += 0.8 * math.sin((t % 0.6) * 180)
            if 0.035 < (t % 0.6) < 0.05:
                value += 0.2 * math.sin((t % 0.6) * 120)
            value += random.uniform(-0.05, 0.05)
            ecg.append(round(value, 4))
        return ecg
    
    def _generate_fever(self, num_points):
        """Generate fever ECG (slightly abnormal)."""
        ecg = []
        for i in range(num_points):
            t = i / self.sample_rate
            value = 0
            if 0.01 < (t % 0.7) < 0.025:
                value += 0.1 * math.sin((t % 0.7) * 100)
            if 0.025 < (t % 0.7) < 0.035:
                value += 0.9 * math.sin((t % 0.7) * 180)
            if 0.035 < (t % 0.7) < 0.05:
                value += 0.25 * math.sin((t % 0.7) * 120)
            value += random.uniform(-0.03, 0.03)
            ecg.append(round(value, 4))
        return ecg
    
    def _generate_hypotension(self, num_points):
        """Generate hypotension ECG (low amplitude)."""
        ecg = []
        for i in range(num_points):
            t = i / self.sample_rate
            value = 0
            if 0.01 < (t % 0.75) < 0.025:
                value += 0.08 * math.sin((t % 0.75) * 100)
            if 0.025 < (t % 0.75) < 0.035:
                value += 0.7 * math.sin((t % 0.75) * 180)
            if 0.035 < (t % 0.75) < 0.05:
                value += 0.2 * math.sin((t % 0.75) * 120)
            value += random.uniform(-0.02, 0.02)
            ecg.append(round(value, 4))
        return ecg
    
    def _generate_cardiac_arrest(self, num_points):
        """Generate cardiac arrest ECG (flatline with occasional spikes)."""
        ecg = []
        for i in range(num_points):
            t = i / self.sample_rate
            # Mostly flatline with occasional electrical activity
            if random.random() < 0.02:  # 2% chance of spike
                value = random.uniform(-0.3, 0.3)
            else:
                value = random.uniform(-0.01, 0.01)
            ecg.append(round(value, 4))
        return ecg