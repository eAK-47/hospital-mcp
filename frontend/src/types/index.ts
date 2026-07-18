export type PatientStatus = "Stable" | "Observation" | "Urgent" | "Critical";

export type Vital = {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  room: string;
  bloodGroup: string;
  admissionDate: string;
  status: PatientStatus;
  condition: string;
  vitals: {
    heartRate: number;
    bloodPressure: string;
    spo2: number;
    temperature: number;
    respiration: number;
  };
  history: string[];
  medications: string[];
  allergies: string[];
  ecg: Array<{ t: number; v: number }>;
};

export type HistoryEvent = {
  id: string;
  patientId: string;
  time: string;
  title: string;
  description: string;
  status: PatientStatus;
};

export type ChecklistItem = {
  id: string;
  label: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  status: PatientStatus;
};

export type ConnectionName =
  | "Simulator"
  | "Backend"
  | "Realtime Database"
  | "MCP Server"
  | "AI Engine"
  | "Prompt Engine"
  | "Tool Registry";

export type ConnectionStatus = {
  name: ConnectionName;
  state: "Waiting" | "Online" | "Offline";
};
