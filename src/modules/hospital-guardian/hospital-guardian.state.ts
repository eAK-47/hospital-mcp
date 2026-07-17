/**
 * Patient State & Schema
 *
 * Maintains in-memory patient state and the Vitals Evaluator (backend logic).
 */

export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export type PatientStatus = 'NORMAL' | 'CRITICAL';

export interface PatientState {
  patient_id: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  blood_pressure: BloodPressure;
  status: PatientStatus;
  condition: string;
  nurse_checklist: string;
  doctor_brief: string;
}

export interface TelemetryInput {
  heart_rate: number;
  spo2: number;
  temperature: number;
  systolic: number;
  diastolic: number;
  ecg?: string;
}

export interface EvaluationResult {
  isCritical: boolean;
  condition: string;
}

/**
 * Default "Normal" patient state as specified in the demo.
 */
export const DEFAULT_PATIENT_STATE: PatientState = {
  patient_id: '402',
  heart_rate: 76,
  spo2: 98,
  temperature: 37.0,
  blood_pressure: { systolic: 120, diastolic: 80 },
  status: 'NORMAL',
  condition: 'Stable',
  nurse_checklist: '',
  doctor_brief: '',
};

/**
 * In-memory patient state store.
 * Starts with the default demo values.
 */
let currentPatientState: PatientState = { ...DEFAULT_PATIENT_STATE };

export function getPatientState(): PatientState {
  return { ...currentPatientState };
}

export function updatePatientState(telemetry: TelemetryInput): PatientState {
  currentPatientState = {
    ...currentPatientState,
    heart_rate: telemetry.heart_rate,
    spo2: telemetry.spo2,
    temperature: telemetry.temperature,
    blood_pressure: {
      systolic: telemetry.systolic,
      diastolic: telemetry.diastolic,
    },
  };
  return getPatientState();
}

/**
 * Vitals Evaluator
 *
 * Evaluates incoming telemetry data and determines if the patient
 * has entered a CRITICAL state based on defined thresholds.
 *
 * Priority order (Cardiac Arrest has highest priority):
 * 1. Cardiac Arrest: heart_rate === 0 AND ecg === "Flatline"
 * 2. Bradycardia: heart_rate < 50 BPM
 * 3. Tachycardia: heart_rate > 120 BPM
 * 4. Hypoxia: spo2 < 90%
 * 5. Fever: temperature > 39°C
 * 6. Hypotension: systolic < 90
 */
export function evaluateVitals(telemetry: TelemetryInput): EvaluationResult {
  // Cardiac Arrest (Highest Priority)
  if (telemetry.heart_rate === 0 && telemetry.ecg?.toLowerCase() === 'flatline') {
    return { isCritical: true, condition: 'Cardiac Arrest' };
  }

  // Bradycardia
  if (telemetry.heart_rate < 50) {
    return { isCritical: true, condition: 'Bradycardia' };
  }

  // Tachycardia
  if (telemetry.heart_rate > 120) {
    return { isCritical: true, condition: 'Tachycardia' };
  }

  // Hypoxia
  if (telemetry.spo2 < 90) {
    return { isCritical: true, condition: 'Hypoxia' };
  }

  // Fever
  if (telemetry.temperature > 39) {
    return { isCritical: true, condition: 'Fever' };
  }

  // Hypotension
  if (telemetry.systolic < 90) {
    return { isCritical: true, condition: 'Hypotension' };
  }

  return { isCritical: false, condition: 'Stable' };
}

/**
 * Applies the Vitals Evaluator to the current telemetry and updates
 * the in-memory patient state accordingly.
 * Returns the updated patient state.
 */
export function processTelemetry(telemetry: TelemetryInput): PatientState {
  updatePatientState(telemetry);
  const evaluation = evaluateVitals(telemetry);

  if (evaluation.isCritical) {
    currentPatientState.status = 'CRITICAL';
    currentPatientState.condition = evaluation.condition;
    currentPatientState.nurse_checklist = generateNurseChecklist(evaluation.condition);
    currentPatientState.doctor_brief = generateDoctorBrief(evaluation.condition, currentPatientState);
  } else {
    currentPatientState.status = 'NORMAL';
    currentPatientState.condition = 'Stable';
    currentPatientState.nurse_checklist = '';
    currentPatientState.doctor_brief = '';
  }

  return getPatientState();
}

/**
 * Generates a nurse checklist based on the emergency condition.
 */
export function generateNurseChecklist(condition: string): string {
  switch (condition) {
    case 'Cardiac Arrest':
      return [
        '🚨 **CODE BLUE – Priority Alert Checklist**',
        '',
        '- [ ] **Call ICU Team** – Page code blue immediately',
        '- [ ] **Start CPR** – Begin chest compressions at 100-120/min',
        '- [ ] **Prepare Defibrillator** – Set to 200J biphasic',
        '- [ ] **Establish IV Access** – Large bore peripheral line',
        '- [ ] **Administer Epinephrine** – 1mg IV push every 3-5 min',
        '- [ ] **Monitor ECG** – Continue rhythm checks',
        '- [ ] **Prepare Intubation Kit** – Notify Anesthesia',
      ].join('\n');
    case 'Bradycardia':
      return [
        '**Nurse Dashboard – Bradycardia Checklist**',
        '',
        '- [ ] **Assess Vital Signs** – Repeat BP, HR, SpO2',
        '- [ ] **Check Cardiac Monitor** – Confirm rhythm',
        '- [ ] **Administer Atropine** – 0.5mg IV push per protocol',
        '- [ ] **Prepare for Transcutaneous Pacing** – If unresponsive',
        '- [ ] **Notify Charge Nurse** – Document all interventions',
        '- [ ] **Monitor Closely** – Re-check vitals every 5 minutes',
      ].join('\n');
    case 'Tachycardia':
      return [
        '**Nurse Dashboard – Tachycardia Checklist**',
        '',
        '- [ ] **Assess Vital Signs** – Full set including SpO2',
        '- [ ] **Obtain 12-Lead ECG** – Identify rhythm origin',
        '- [ ] **Check Electrolytes** – Stat lab draw (K+, Mg2+)',
        '- [ ] **Prepare Adenosine** – 6mg rapid IV push if SVT',
        '- [ ] **Monitor for Instability** – Chest pain, SOB, dizziness',
        '- [ ] **Notify Provider** – Document heart rate trend',
      ].join('\n');
    case 'Hypoxia':
      return [
        '**Nurse Dashboard – Hypoxia Checklist**',
        '',
        '- [ ] **Increase Oxygen** – Titrate to SpO2 ≥ 94%',
        '- [ ] **Assess Airway** – Suction if needed, position upright',
        '- [ ] **Auscultate Lung Sounds** – Assess for wheezes/crackles',
        '- [ ] **Check ABG** – Stat arterial blood gas',
        '- [ ] **Consider BiPAP** – If SpO2 remains < 90% on high-flow',
        '- [ ] **Notify Respiratory Therapy** – Document O2 saturation',
      ].join('\n');
    case 'Fever':
      return [
        '**Nurse Dashboard – Fever Checklist**',
        '',
        '- [ ] **Administer Antipyretic** – Acetaminophen 650mg PO/IV',
        '- [ ] **Obtain Blood Cultures** – Two sets from different sites',
        '- [ ] **Start Sepsis Workup** – CBC, BMP, Lactate, Urinalysis',
        '- [ ] **Apply Cooling Measures** – Cooling blanket, cold IV fluids',
        '- [ ] **Monitor Temperature** – Re-check every 30 minutes',
        '- [ ] **Notify Infectious Disease** – Document fever curve',
      ].join('\n');
    case 'Hypotension':
      return [
        '**Nurse Dashboard – Hypotension Checklist**',
        '',
        '- [ ] **Place Patient Supine** – Trendelenburg position if needed',
        '- [ ] **Administer Fluid Bolus** – 500mL NS IV wide open',
        '- [ ] **Check Orthostatic Vitals** – BP lying, sitting, standing',
        '- [ ] **Review Medications** – Hold antihypertensives',
        '- [ ] **Obtain Labs** – CBC, BMP, Lactate, Troponin',
        '- [ ] **Prepare Vasopressors** – Norepinephrine drip if refractory',
      ].join('\n');
    default:
      return '';
  }
}

/**
 * Generates a doctor brief based on the emergency condition and current vitals.
 */
export function generateDoctorBrief(condition: string, state: PatientState): string {
  const vitalsSummary =
    `HR: ${state.heart_rate} BPM | SpO2: ${state.spo2}% | Temp: ${state.temperature}°C | BP: ${state.blood_pressure.systolic}/${state.blood_pressure.diastolic}`;

  switch (condition) {
    case 'Cardiac Arrest':
      return [
        '**Doctor Dashboard – Cardiac Arrest Technical Summary**',
        '',
        `**Patient ID:** ${state.patient_id}`,
        `**Vitals:** ${vitalsSummary}`,
        `**ECG:** Flatline (Asystole)`,
        '',
        '**Diagnosis:** Cardiac Arrest / Asystole',
        '',
        '**Immediate Actions Required:**',
        '- Activate Code Blue protocol',
        '- Initiate high-quality CPR (30:2 ratio)',
        '- Defibrillation is NOT recommended for asystole',
        '- Epinephrine 1mg IV every 3-5 minutes',
        '- Consider advanced airway (ET intubation)',
        '- Reversible causes: Hs and Ts (Hypoxia, Hypovolemia, H+ acidosis, Hypo/Hyperkalemia, Hypothermia, Tension pneumothorax, Tamponade, Toxins, Thrombosis)',
        '',
        '**Prognosis:** Critical – Immediate intervention required',
      ].join('\n');
    case 'Bradycardia':
      return [
        '**Doctor Dashboard – Bradycardia Technical Summary**',
        '',
        `**Patient ID:** ${state.patient_id}`,
        `**Vitals:** ${vitalsSummary}`,
        '',
        '**Diagnosis:** Symptomatic Bradycardia (HR < 50 BPM)',
        '',
        '**Clinical Assessment:**',
        '- Evaluate for hemodynamic instability',
        '- Check for reversible causes (medications, ischemia, electrolyte imbalance)',
        '- Assess need for transcutaneous pacing',
        '',
        '**Treatment Plan:**',
        '- First-line: Atropine 0.5mg IV every 3-5 min (max 3mg)',
        '- Second-line: Transcutaneous pacing if unresponsive',
        '- Consider Dopamine or Epinephrine infusion',
      ].join('\n');
    case 'Tachycardia':
      return [
        '**Doctor Dashboard – Tachycardia Technical Summary**',
        '',
        `**Patient ID:** ${state.patient_id}`,
        `**Vitals:** ${vitalsSummary}`,
        '',
        '**Diagnosis:** Tachycardia (HR > 120 BPM)',
        '',
        '**Clinical Assessment:**',
        '- Obtain 12-lead ECG to differentiate SVT vs VT vs AFib',
        '- Assess for hemodynamic stability',
        '- Evaluate electrolyte panel (K+, Mg2+, Ca2+)',
        '',
        '**Treatment Plan:**',
        '- Stable SVT: Vagal maneuvers → Adenosine 6mg IV push',
        '- Stable VT: Amiodarone 150mg IV over 10 min',
        '- Unstable: Synchronized cardioversion',
      ].join('\n');
    case 'Hypoxia':
      return [
        '**Doctor Dashboard – Hypoxia Technical Summary**',
        '',
        `**Patient ID:** ${state.patient_id}`,
        `**Vitals:** ${vitalsSummary}`,
        '',
        '**Diagnosis:** Acute Hypoxemic Respiratory Failure (SpO2 < 90%)',
        '',
        '**Clinical Assessment:**',
        '- ABG: PaO2, PaCO2, pH, HCO3',
        '- Chest X-ray: Evaluate for pneumonia, pulmonary edema',
        '- Bedside lung ultrasound if available',
        '',
        '**Treatment Plan:**',
        '- Titrate O2 to target SpO2 ≥ 94%',
        '- Consider Non-Invasive Ventilation (BiPAP)',
        '- Treat underlying cause (antibiotics, diuretics, bronchodilators)',
        '- Prepare for intubation if refractory',
      ].join('\n');
    case 'Fever':
      return [
        '**Doctor Dashboard – Fever Technical Summary**',
        '',
        `**Patient ID:** ${state.patient_id}`,
        `**Vitals:** ${vitalsSummary}`,
        '',
        '**Diagnosis:** Hyperpyrexia (Temp > 39°C)',
        '',
        '**Clinical Assessment:**',
        '- Sepsis screening: qSOFA score, lactate level',
        '- Blood cultures × 2, sputum culture, urinalysis with culture',
        '- Chest X-ray, consider CT imaging based on source suspicion',
        '',
        '**Treatment Plan:**',
        '- Antipyretics: Acetaminophen 650mg or NSAIDs',
        '- Empiric antibiotics per sepsis protocol',
        '- Source control: Drain abscess, remove lines if infected',
        '- Cooling measures if temp > 40°C',
      ].join('\n');
    case 'Hypotension':
      return [
        '**Doctor Dashboard – Hypotension Technical Summary**',
        '',
        `**Patient ID:** ${state.patient_id}`,
        `**Vitals:** ${vitalsSummary}`,
        '',
        '**Diagnosis:** Acute Hypotension (Systolic BP < 90 mmHg)',
        '',
        '**Clinical Assessment:**',
        '- Assess for distributive, cardiogenic, hypovolemic, or obstructive shock',
        '- Point-of-care ultrasound (RUSH protocol)',
        '- Labs: CBC, BMP, Lactate, Troponin, BNP',
        '',
        '**Treatment Plan:**',
        '- IV fluid bolus: 500mL-1000mL NS or Lactated Ringer\'s',
        '- Vasopressors: Norepinephrine 0.1-0.5 mcg/kg/min',
        '- Inotropes: Dobutamine if cardiogenic shock suspected',
        '- Identify and treat underlying cause',
      ].join('\n');
    default:
      return '';
  }
}