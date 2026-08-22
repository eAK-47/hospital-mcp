/**
 * Real API Service for Hospital Guardian
 * 
 * Connects to the MCP server HTTP endpoints.
 * Falls back to mock data when VITE_USE_MOCK_DATA is true.
 */

import type { Patient, HistoryEvent, ChecklistItem, NotificationItem, ConnectionStatus } from "../types";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

// Import mock data as fallback
import patientsData from "../data/patients.json";
import historyData from "../data/history.json";
import checklistData from "../data/checklist.json";
import notificationsData from "../data/notifications.json";

const connectionStatuses: ConnectionStatus[] = [
  { name: "Simulator", state: "Online" },
  { name: "Backend", state: "Online" },
  { name: "Realtime Database", state: "Online" },
  { name: "MCP Server", state: "Online" },
  { name: "AI Engine", state: "Online" },
  { name: "Prompt Engine", state: "Online" },
  { name: "Tool Registry", state: "Online" }
];

// Map database status to frontend PatientStatus
function mapStatus(status: string | undefined): Patient["status"] {
  switch ((status || "").toUpperCase()) {
    case "CRITICAL":
      return "Critical";
    case "WARNING":
      return "Urgent";
    case "OBSERVATION":
      return "Observation";
    default:
      return "Stable";
  }
}

// Transform database patient to frontend format
function transformPatient(dbPatient: any): Patient & { doctor_brief?: string; nurse_checklist?: string } {
  return {
    id: dbPatient.patient_id || dbPatient.id,
    name: dbPatient.name || "John Doe",
    age: dbPatient.age || 45,
    gender: dbPatient.gender || "Male",
    room: dbPatient.room || "ICU Bed 4",
    bloodGroup: "O+",
    admissionDate: "2024-01-15",
    status: mapStatus(dbPatient.status),
    condition: dbPatient.condition || "Stable",
    vitals: {
      heartRate: dbPatient.heart_rate || 0,
      bloodPressure: `${dbPatient.blood_pressure?.systolic || 0}/${dbPatient.blood_pressure?.diastolic || 0}`,
      spo2: dbPatient.spo2 || 0,
      temperature: dbPatient.temperature || 0,
      respiration: dbPatient.respiration || 0,
    },
    history: dbPatient.history || [],
    medications: dbPatient.medications || [],
    allergies: dbPatient.allergies || [],
    ecg: dbPatient.ecg || [],
    doctor_brief: dbPatient.doctor_brief,
    nurse_checklist: dbPatient.nurse_checklist,
  };
}

// For backward compatibility with existing components, we need sync versions
// that use mock data when USE_MOCK_DATA is true
const patients = patientsData as Patient[];
const history = historyData as HistoryEvent[];
const checklist = checklistData as ChecklistItem[];
const notifications = notificationsData as NotificationItem[];

// Cache for async data
let cachedPatients: Patient[] | null = null;
let cachedChecklist: ChecklistItem[] | null = null;
let cachedNotifications: NotificationItem[] | null = null;
let cachedConnections: ConnectionStatus[] | null = null;

// Bootstrap: load real patients from the backend into the cache so sync
// API functions (getPatients, getPatient, getPriorityPatient) return real data.
export async function loadPatients(): Promise<Patient[]> {
  if (USE_MOCK_DATA) {
    cachedPatients = patients;
    return patients;
  }
  try {
    const response = await fetch(`${BASE_URL}/api/patients`);
    if (!response.ok) throw new Error("Failed to fetch patients");
    const data = await response.json();
    const transformed = data.map(transformPatient);
    cachedPatients = transformed;
    return transformed;
  } catch (error) {
    console.warn("API failed, falling back to mock data:", error);
    cachedPatients = patients;
    return patients;
  }
}

// Async versions that fetch from backend
async function fetchPatients(): Promise<Patient[]> {
  if (USE_MOCK_DATA) return patients;
  try {
    const response = await fetch(`${BASE_URL}/api/patients`);
    if (!response.ok) throw new Error("Failed to fetch patients");
    const data = await response.json();
    return data.map(transformPatient);
  } catch (error) {
    console.warn("API failed, falling back to mock data:", error);
    return patients;
  }
}

async function fetchPatient(id?: string): Promise<Patient> {
  if (USE_MOCK_DATA) {
    return patients.find((patient) => patient.id === id) ?? patients[0];
  }
  try {
    const response = await fetch(`${BASE_URL}/api/patients/${id || "402"}`);
    if (!response.ok) throw new Error("Failed to fetch patient");
    return transformPatient(await response.json());
  } catch (error) {
    console.warn("API failed, falling back to mock data:", error);
    return patients.find((patient) => patient.id === id) ?? patients[0];
  }
}

async function fetchPriorityPatient(): Promise<Patient> {
  if (USE_MOCK_DATA) {
    const priority = ["Critical", "Urgent", "Observation", "Stable"];
    return [...patients].sort(
      (a, b) => priority.indexOf(a.status) - priority.indexOf(b.status)
    )[0];
  }
  try {
    const response = await fetch(`${BASE_URL}/api/patients/priority`);
    if (!response.ok) throw new Error("Failed to fetch priority patient");
    return transformPatient(await response.json());
  } catch (error) {
    console.warn("API failed, falling back to mock data:", error);
    const priority = ["Critical", "Urgent", "Observation", "Stable"];
    return [...patients].sort(
      (a, b) => priority.indexOf(a.status) - priority.indexOf(b.status)
    )[0];
  }
}

async function fetchHistory(patientId?: string): Promise<HistoryEvent[]> {
  if (USE_MOCK_DATA) {
    return history.filter((event) => !patientId || event.patientId === patientId);
  }
  try {
    const response = await fetch(`${BASE_URL}/api/history${patientId ? `?patientId=${patientId}` : ""}`);
    if (!response.ok) throw new Error("Failed to fetch history");
    return await response.json();
  } catch (error) {
    console.warn("API failed, falling back to mock data:", error);
    return history.filter((event) => !patientId || event.patientId === patientId);
  }
}

async function fetchChecklist(): Promise<ChecklistItem[]> {
  if (USE_MOCK_DATA) return checklist;
  try {
    const response = await fetch(`${BASE_URL}/api/checklist`);
    if (!response.ok) throw new Error("Failed to fetch checklist");
    return await response.json();
  } catch (error) {
    console.warn("API failed, falling back to mock data:", error);
    return checklist;
  }
}

async function fetchNotifications(): Promise<NotificationItem[]> {
  if (USE_MOCK_DATA) return notifications;
  try {
    const response = await fetch(`${BASE_URL}/api/notifications`);
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return await response.json();
  } catch (error) {
    console.warn("API failed, falling back to mock data:", error);
    return notifications;
  }
}

async function fetchConnections(): Promise<ConnectionStatus[]> {
  if (USE_MOCK_DATA) return connectionStatuses;
  try {
    const response = await fetch(`${BASE_URL}/api/connections`);
    if (!response.ok) throw new Error("Failed to fetch connections");
    return await response.json();
  } catch (error) {
    console.warn("API failed, falling back to mock data:", error);
    return connectionStatuses;
  }
}

// Sync versions for backward compatibility (use cached or mock data)
export const api = {
  getPatients: (): Patient[] => {
    return cachedPatients !== null ? cachedPatients : patients;
  },

  getPatient: (id?: string): Patient => {
    const allPatients = (cachedPatients as Patient[] | null) ?? patients;
    return allPatients.find((p: Patient) => p.id === id) ?? allPatients[0];
  },

  getPriorityPatient: (): Patient => {
    const allPatients = (cachedPatients as Patient[] | null) ?? patients;
    const priority = ["Critical", "Urgent", "Observation", "Stable"];
    return [...allPatients].sort(
      (a: Patient, b: Patient) => priority.indexOf(a.status) - priority.indexOf(b.status)
    )[0];
  },

  getHistory: (patientId?: string): HistoryEvent[] => {
    return history.filter((event) => !patientId || event.patientId === patientId);
  },

  getChecklist: (): ChecklistItem[] => {
    return cachedChecklist ?? checklist;
  },

  getNotifications: (): NotificationItem[] => {
    return cachedNotifications ?? notifications;
  },

  getConnections: (): ConnectionStatus[] => {
    return cachedConnections ?? connectionStatuses;
  },

  // Async versions for real API calls
  fetchPatients,
  fetchPatient,
  fetchPriorityPatient,
  fetchHistory,
  fetchChecklist,
  fetchNotifications,
  fetchConnections,

  // Real-time telemetry update (async)
  updateTelemetry: async (telemetry: {
    heart_rate: number;
    spo2: number;
    temperature: number;
    systolic: number;
    diastolic: number;
    ecg?: string;
  }) => {
    if (USE_MOCK_DATA) {
      return { success: true };
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telemetry),
      });
      if (!response.ok) throw new Error("Failed to update telemetry");
      return await response.json();
    } catch (error) {
      console.error("Failed to update telemetry:", error);
      throw error;
    }
  },
};
