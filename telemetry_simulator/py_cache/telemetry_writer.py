import json

def save(patient):
    with open("telemetry.json", "w") as f:
        json.dump(patient.to_dict(), f, indent=4)