"""
constants.py
---------------------------------------
Constants and configuration values for the telemetry simulator.
"""

# Status constants
STATUS_NORMAL = "NORMAL"
STATUS_WARNING = "WARNING"
STATUS_CRITICAL = "CRITICAL"

# Condition constants
CONDITION_STABLE = "Stable"
CONDITION_BRADYCARDIA = "Bradycardia"
CONDITION_TACHYCARDIA = "Tachycardia"
CONDITION_HYPOXIA = "Hypoxia"
CONDITION_FEVER = "High Fever"
CONDITION_HYPOTENSION = "Hypotension"
CONDITION_CARDIAC_ARREST = "Cardiac Arrest"

# Alert priority constants
HIGH = "HIGH"
MEDIUM = "MEDIUM"
CRITICAL = "CRITICAL"

# Color mapping for conditions
COLORS = {
    STATUS_NORMAL: "#2ECC71",
    CONDITION_BRADYCARDIA: "#3498DB",
    CONDITION_TACHYCARDIA: "#E67E22",
    CONDITION_HYPOXIA: "#8E44AD",
    CONDITION_FEVER: "#FF8C00",
    CONDITION_HYPOTENSION: "#8B4513",
    CONDITION_CARDIAC_ARREST: "#E74C3C"
}