
STATUS_NORMAL = "NORMAL"
STATUS_WARNING = "WARNING"
STATUS_CRITICAL = "CRITICAL"
STATUS_DECEASED = "DECEASED"


CONDITION_STABLE = "Stable"

CONDITION_BRADYCARDIA = "Bradycardia"

CONDITION_TACHYCARDIA = "Tachycardia"

CONDITION_HYPOXIA = "Hypoxia"

CONDITION_FEVER = "High Fever"

CONDITION_HYPOTENSION = "Hypotension"

CONDITION_CARDIAC_ARREST = "Cardiac Arrest"

CONDITION_RECOVERING = "Recovering"

CONDITION_DECEASED = "Patient Deceased"


LOW = "LOW"

MEDIUM = "MEDIUM"

HIGH = "HIGH"

CRITICAL = "CRITICAL"


COLORS = {

    STATUS_NORMAL: "#2ECC71",

    STATUS_WARNING: "#F1C40F",

    CONDITION_BRADYCARDIA: "#3498DB",

    CONDITION_TACHYCARDIA: "#E67E22",

    CONDITION_HYPOXIA: "#9B59B6",

    CONDITION_FEVER: "#FF8C00",

    CONDITION_HYPOTENSION: "#8B4513",

    CONDITION_CARDIAC_ARREST: "#E74C3C",

    STATUS_DECEASED: "#000000"
}


AI_MESSAGES = {

    CONDITION_BRADYCARDIA: {
        "priority": HIGH,
        "title": "Bradycardia Detected",
        "message": (
            "Heart rate has fallen below the safe threshold. "
            "Prepare Atropine, continue ECG monitoring, and notify cardiology."
        )
    },

    CONDITION_TACHYCARDIA: {
        "priority": HIGH,
        "title": "Tachycardia Detected",
        "message": (
            "Heart rate is critically elevated. "
            "Assess the patient, obtain ECG, provide oxygen if needed."
        )
    },

    CONDITION_HYPOXIA: {
        "priority": HIGH,
        "title": "Hypoxia Detected",
        "message": (
            "SpO₂ has dropped below 90%. "
            "Start oxygen therapy and assess airway immediately."
        )
    },

    CONDITION_FEVER: {
        "priority": MEDIUM,
        "title": "High Fever",
        "message": (
            "Temperature exceeds 39°C. "
            "Notify physician and investigate possible infection."
        )
    },

    CONDITION_HYPOTENSION: {
        "priority": HIGH,
        "title": "Hypotension",
        "message": (
            "Blood pressure is critically low. "
            "Administer IV fluids and monitor circulation."
        )
    },

    CONDITION_CARDIAC_ARREST: {
        "priority": CRITICAL,
        "title": "CODE BLUE",
        "message": (
            "Cardiac arrest detected. "
            "Start CPR immediately and prepare defibrillator."
        )
    }

}

NURSE_ACTIONS = {

    CONDITION_BRADYCARDIA: [
        "Bring crash cart",
        "Prepare Atropine",
        "Monitor ECG",
        "Call Doctor"
    ],

    CONDITION_TACHYCARDIA: [
        "Attach ECG leads",
        "Provide Oxygen",
        "Monitor BP",
        "Call Doctor"
    ],

    CONDITION_HYPOXIA: [
        "Administer Oxygen",
        "Check Airway",
        "Prepare Ventilator",
        "Call Doctor"
    ],

    CONDITION_FEVER: [
        "Measure Temperature",
        "Collect Blood Sample",
        "Administer Antipyretic"
    ],

    CONDITION_HYPOTENSION: [
        "Raise Legs",
        "Start IV Fluids",
        "Monitor BP"
    ],

    CONDITION_CARDIAC_ARREST: [
        "CODE BLUE",
        "Start CPR",
        "Prepare Defibrillator",
        "Call ICU Team"
    ]
}



DOCTOR_ACTIONS = {

    CONDITION_BRADYCARDIA: [
        "Review medications",
        "Evaluate pacemaker requirement",
        "Administer Atropine"
    ],

    CONDITION_TACHYCARDIA: [
        "Obtain ECG",
        "Review electrolyte levels",
        "Treat underlying cause"
    ],

    CONDITION_HYPOXIA: [
        "Evaluate respiratory failure",
        "Start oxygen therapy",
        "Request chest imaging"
    ],

    CONDITION_FEVER: [
        "Investigate infection",
        "Start antibiotics if indicated"
    ],

    CONDITION_HYPOTENSION: [
        "Administer IV fluids",
        "Consider vasopressors"
    ],

    CONDITION_CARDIAC_ARREST: [
        "Follow ACLS Protocol",
        "Continue CPR",
        "Prepare Defibrillation"
    ]
}


MCP_EVENTS = {

    CONDITION_BRADYCARDIA: "mcp.bradycardia",

    CONDITION_TACHYCARDIA: "mcp.tachycardia",

    CONDITION_HYPOXIA: "mcp.hypoxia",

    CONDITION_FEVER: "mcp.fever",

    CONDITION_HYPOTENSION: "mcp.hypotension",

    CONDITION_CARDIAC_ARREST: "mcp.code_blue"
}