"""
ai_client.py
---------------------------------------
AI Brief Generation Client
---------------------------------------
Calls the MCP server's AI endpoint to generate nurse checklists and doctor briefs.
Falls back to local template-based generation if the API call fails.
"""

import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

AI_BASE_URL = os.getenv('AI_BASE_URL', 'https://api.openai.com/v1')
AI_API_KEY = os.getenv('AI_API_KEY', '')
AI_MODEL = os.getenv('AI_MODEL', 'gpt-4o-mini')

# Local template-based fallback
NURSE_TEMPLATES = {
    "Bradycardia": [
        "🚨 **Bradycardia Alert**",
        "- [ ] Bring Crash Cart",
        "- [ ] Prepare Atropine",
        "- [ ] Continuous ECG Monitoring",
        "- [ ] Call Doctor Immediately"
    ],
    "Tachycardia": [
        "🚨 **Tachycardia Alert**",
        "- [ ] Provide Oxygen",
        "- [ ] Monitor Blood Pressure",
        "- [ ] Attach ECG Leads",
        "- [ ] Notify Doctor"
    ],
    "Hypoxia": [
        "🚨 **Hypoxia Alert**",
        "- [ ] Administer Oxygen",
        "- [ ] Check Airway",
        "- [ ] Prepare Ventilator",
        "- [ ] Call Doctor"
    ],
    "High Fever": [
        "⚠️ **High Fever Alert**",
        "- [ ] Measure Temperature",
        "- [ ] Collect Blood Sample",
        "- [ ] Administer Antipyretic",
        "- [ ] Notify Doctor"
    ],
    "Hypotension": [
        "🚨 **Hypotension Alert**",
        "- [ ] Raise Legs",
        "- [ ] Start IV Fluids",
        "- [ ] Monitor Blood Pressure",
        "- [ ] Call Doctor"
    ],
    "Cardiac Arrest": [
        "🚨 **CODE BLUE – Priority Alert Checklist**",
        "- [ ] Call ICU Team – Page code blue immediately",
        "- [ ] Start CPR – Begin chest compressions at 100-120/min",
        "- [ ] Prepare Defibrillator – Set to 200J biphasic",
        "- [ ] Establish IV Access – Large bore peripheral line",
        "- [ ] Administer Epinephrine – 1mg IV push every 3-5 min",
        "- [ ] Monitor ECG – Continue rhythm checks",
        "- [ ] Prepare Intubation Kit – Notify Anesthesia"
    ]
}

DOCTOR_TEMPLATES = {
    "Bradycardia": {
        "title": "Bradycardia Detected",
        "summary": "Heart rate below 50 BPM. Immediate assessment required.",
        "actions": [
            "Review medications for bradycardia side effects",
            "Evaluate pacemaker requirement",
            "Administer Atropine 0.5-1mg IV"
        ]
    },
    "Tachycardia": {
        "title": "Tachycardia Detected",
        "summary": "Heart rate above 120 BPM. Assess for underlying cause.",
        "actions": [
            "Obtain ECG rhythm strip",
            "Review electrolyte levels",
            "Consider rate control medication"
        ]
    },
    "Hypoxia": {
        "title": "Hypoxia Detected",
        "summary": "SpO₂ below 90%. Oxygen therapy required.",
        "actions": [
            "Evaluate respiratory failure",
            "Start oxygen therapy 15L via non-rebreather",
            "Request chest imaging"
        ]
    },
    "High Fever": {
        "title": "High Fever",
        "summary": "Temperature above 39°C. Investigate infection source.",
        "actions": [
            "Investigate infection source",
            "Start antibiotics if indicated",
            "Consider blood cultures"
        ]
    },
    "Hypotension": {
        "title": "Hypotension",
        "summary": "Blood pressure critically low. Administer IV fluids.",
        "actions": [
            "Administer IV fluids bolus",
            "Consider vasopressors if fluid-refractory",
            "Assess for sepsis"
        ]
    },
    "Cardiac Arrest": {
        "title": "CODE BLUE",
        "summary": "Cardiac Arrest Detected. Start CPR immediately.",
        "actions": [
            "Follow ACLS Protocol",
            "Continue CPR with high-quality compressions",
            "Prepare for defibrillation if shockable rhythm"
        ]
    }
}

def generate_local_briefs(condition, heart_rate, spo2, temperature, systolic, diastolic):
    """
    Generate nurse checklist and doctor brief using local templates.
    
    Args:
        condition: The diagnosed condition
        heart_rate, spo2, temperature, systolic, diastolic: Vital signs
        
    Returns:
        Dict with nurse_checklist and doctor_brief
    """
    nurse_checklist = '\n'.join(NURSE_TEMPLATES.get(condition, ["No specific actions required"]))
    
    template = DOCTOR_TEMPLATES.get(condition, {})
    doctor_brief = f"""**Doctor Dashboard – {condition} Technical Summary**

**Vitals:** HR: {heart_rate} BPM | SpO₂: {spo2}% | Temp: {temperature}°C | BP: {systolic}/{diastolic}

**Diagnosis:** {condition}

**Clinical Summary:** {template.get('summary', 'No summary available')}

**Immediate Actions Required:**
{chr(10).join('- ' + a for a in template.get('actions', ['No specific actions']))}

**Prognosis:** Requires immediate medical attention"""
    
    return {
        "nurse_checklist": nurse_checklist,
        "doctor_brief": doctor_brief
    }

def generate_ai_briefs(telemetry, condition):
    """
    Generate AI briefs by calling the LLM API.
    Falls back to local templates if API call fails.
    
    Args:
        telemetry: Dict with heart_rate, spo2, temperature, systolic, diastolic, ecg
        condition: The diagnosed condition
        
    Returns:
        Dict with nurse_checklist and doctor_brief
    """
    # Build the system prompt
    vitals = {
        "patient_id": "402",
        "heart_rate": telemetry["heart_rate"],
        "spo2": telemetry["spo2"],
        "temperature": telemetry["temperature"],
        "blood_pressure": {
            "systolic": telemetry["systolic"],
            "diastolic": telemetry["diastolic"]
        },
        "status": "CRITICAL",
        "condition": condition
    }
    
    system_prompt = f"""You are a critical care AI assistant. Generate structured medical briefs for ICU patient care.

Patient Vitals:
- Heart Rate: {vitals['heart_rate']} BPM
- SpO2: {vitals['spo2']}%
- Temperature: {vitals['temperature']}°C
- Blood Pressure: {vitals['blood_pressure']['systolic']}/{vitals['blood_pressure']['diastolic']} mmHg
- Condition: {condition}

Return ONLY a valid JSON object with these fields:
- nurse_checklist: Markdown checklist of bedside tasks (use emoji headers, checkboxes)
- doctor_brief: Clinical summary with diagnosis, actions, and prognosis"""
    
    headers = {
        'Content-Type': 'application/json',
    }
    
    if AI_API_KEY:
        headers['Authorization'] = f'Bearer {AI_API_KEY}'
    
    try:
        response = requests.post(
            f"{AI_BASE_URL.rstrip('/')}/chat/completions",
            headers=headers,
            json={
                "model": AI_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "Generate the nurse checklist and doctor brief for this patient."}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.3,
                "max_tokens": 1000
            },
            timeout=10
        )
        
        if response.ok:
            data = response.json()
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '{}')
            parsed = json.loads(content)
            
            if 'nurse_checklist' in parsed and 'doctor_brief' in parsed:
                return parsed
    except Exception as e:
        print(f"AI API call failed: {e}")
    
    # Fallback to local templates
    print("Falling back to local template-based brief generation.")
    return generate_local_briefs(
        condition,
        telemetry["heart_rate"],
        telemetry["spo2"],
        telemetry["temperature"],
        telemetry["systolic"],
        telemetry["diastolic"]
    )