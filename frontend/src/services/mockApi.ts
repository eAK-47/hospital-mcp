import patientsData from "../data/patients.json";
import historyData from "../data/history.json";
import checklistData from "../data/checklist.json";
import notificationsData from "../data/notifications.json";
import type {
  ChecklistItem,
  ConnectionStatus,
  HistoryEvent,
  NotificationItem,
  Patient
} from "../types";

const connectionStatuses: ConnectionStatus[] = [
  { name: "Simulator", state: "Waiting" },
  { name: "Backend", state: "Waiting" },
  { name: "Realtime Database", state: "Waiting" },
  { name: "MCP Server", state: "Waiting" },
  { name: "AI Engine", state: "Waiting" },
  { name: "Prompt Engine", state: "Waiting" },
  { name: "Tool Registry", state: "Waiting" }
];

// Future backend integration starts here.
// Keep page components consuming this service layer and replace these functions with fetch calls later.
export const mockApi = {
  getPatients: (): Patient[] => patientsData as Patient[],
  getPatient: (id?: string): Patient => {
    const patients = patientsData as Patient[];
    return patients.find((patient) => patient.id === id) ?? patients[0];
  },
  getPriorityPatient: (): Patient => {
    const priority = ["Critical", "Urgent", "Observation", "Stable"];
    return [...(patientsData as Patient[])].sort(
      (a, b) => priority.indexOf(a.status) - priority.indexOf(b.status)
    )[0];
  },
  getHistory: (patientId?: string): HistoryEvent[] =>
    (historyData as HistoryEvent[]).filter((event) => !patientId || event.patientId === patientId),
  getChecklist: (): ChecklistItem[] => checklistData as ChecklistItem[],
  getNotifications: (): NotificationItem[] => notificationsData as NotificationItem[],
  getConnections: (): ConnectionStatus[] => connectionStatuses
};
