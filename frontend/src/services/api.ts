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
  { name: "Simulator", state: "Waiting" },
  { name: "Backend", state: "Waiting" },
  { name: "Realtime Database", state: "Waiting" },
  { name: "MCP Server", state: "Waiting" },
  { name: "AI Engine", state: "Waiting" },
  { name: "Prompt Engine", state: "Waiting" },
  { name: "Tool Registry", state: "Waiting" }
];

// Transform database patient to frontend format
function transformPatient(dbPatient: any): Patient {
  return {
    id: dbPatient.patient_id || dbPatient.id,
    name: dbPatient.name || "John Doe",
    age: dbPatient.age || 45,
    gender: dbPatient.gender || "Male",
    room: dbPatient.room || "ICU Bed 4",
    bloodGroup: "O+",
    admissionDate: "2024-01-15",
    status: dbPatient.status || "Stable",
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
  };
}

export const api = {
  getPatients: async (): Promise<Patient[]> => {
    if (USE_MOCK_DATA) {
      return patientsData as Patient[];
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/patients`);
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      return data.map(transformPatient);
    } catch (error) {
      console.warn("API failed, falling back to mock data:", error);
      return patientsData as Patient[];
    }
  },

  getPatient: async (id?: string): Promise<Patient> => {
    if (USE_MOCK_DATA) {
      const patients = patientsData as Patient[];
      return patients.find((patient) => patient.id === id) ?? patients[0];
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/patients/${id || "402"}`);
      if (!response.ok) throw new Error("Failed to fetch patient");
      return transformPatient(await response.json());
    } catch (error) {
      console.warn("API failed, falling back to mock data:", error);
      const patients = patientsData as Patient[];
      return patients.find((patient) => patient.id === id) ?? patients[0];
    }
  },

  getPriorityPatient: async (): Promise<Patient> => {
    if (USE_MOCK_DATA) {
      const priority = ["Critical", "Urgent", "Observation", "Stable"];
      return [...(patientsData as Patient[])].sort(
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
      return [...(patientsData as Patient[])].sort(
        (a, b) => priority.indexOf(a.status) - priority.indexOf(b.status)
      )[0];
    }
  },

  getHistory: async (patientId?: string): Promise<HistoryEvent[]> => {
    if (USE_MOCK_DATA) {
      return (historyData as HistoryEvent[]).filter(
        (event) => !patientId || event.patientId === patientId
      );
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/history${patientId ? `?patientId=${patientId}` : ""}`);
      if (!response.ok) throw new Error("Failed to fetch history");
      return await response.json();
    } catch (error) {
      console.warn("API failed, falling back to mock data:", error);
      return (historyData as HistoryEvent[]).filter(
        (event) => !patientId || event.patientId === patientId
      );
    }
  },

  getChecklist: async (): Promise<ChecklistItem[]> => {
    if (USE_MOCK_DATA) {
      return checklistData as ChecklistItem[];
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/checklist`);
      if (!response.ok) throw new Error("Failed to fetch checklist");
      return await response.json();
    } catch (error) {
      console.warn("API failed, falling back to mock data:", error);
      return checklistData as ChecklistItem[];
    }
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    if (USE_MOCK_DATA) {
      return notificationsData as NotificationItem[];
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/notifications`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return await response.json();
    } catch (error) {
      console.warn("API failed, falling back to mock data:", error);
      return notificationsData as NotificationItem[];
    }
  },

  getConnections: async (): Promise<ConnectionStatus[]> => {
    if (USE_MOCK_DATA) {
      return connectionStatuses;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/connections`);
      if (!response.ok) throw new Error("Failed to fetch connections");
      return await response.json();
    } catch (error) {
      console.warn("API failed, falling back to mock data:", error);
      return connectionStatuses;
    }
  },

  // Real-time telemetry update
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