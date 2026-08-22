import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiAlertOctagon, FiSave } from "react-icons/fi";
import Checklist from "../components/Checklist";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import VitalCard from "../components/VitalCard";
import { mockApi } from "../services/mockApi";
import type { ChecklistItem, Vital } from "../types";

type AiChecklist = {
  patient_id: string;
  condition: string;
  items: ChecklistItem[];
};

export default function NurseStation() {
  const patient = mockApi.getPriorityPatient();
  const checklist = mockApi.getChecklist();
  const vitals: Vital[] = [
    { label: "Heart Rate", value: patient.vitals.heartRate, unit: "bpm", trend: "down" },
    { label: "Blood Pressure", value: patient.vitals.bloodPressure, unit: "mmHg", trend: "down" },
    { label: "SpO2", value: patient.vitals.spo2, unit: "%", trend: "down" },
    { label: "Temperature", value: patient.vitals.temperature, unit: "C", trend: "up" }
  ];

  const [aiChecklist, setAiChecklist] = useState<AiChecklist | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAiChecklist() {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3001";
        const response = await fetch(
          `${baseUrl}/api/ai/checklist?patientId=${encodeURIComponent(patient.id)}`
        );
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setAiChecklist(data);
          setAiError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setAiError(err instanceof Error ? err.message : "Failed to load AI checklist");
        }
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }

    loadAiChecklist();
    const interval = setInterval(loadAiChecklist, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [patient.id]);

  return (
    <section>
      <PageHeader
        title="Nurse Station"
        description="Action-first nursing view with clear patient priority, immediate steps, notes, and AI checklist placeholder."
        action={<StatusBadge status={patient.status} />}
      />

      {patient.status === "Critical" ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-lg border border-status-critical/50 bg-status-critical/15 p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <FiAlertOctagon className="h-8 w-8 text-status-critical" />
              <div>
                <h3 className="text-2xl font-extrabold text-white">CODE BLUE</h3>
                <p className="font-semibold text-status-critical">Doctor Required Immediately</p>
              </div>
            </div>
            <span className="text-sm font-bold uppercase tracking-wide text-white">Emergency Protocol Active</span>
          </div>
        </motion.div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          <section className="panel p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-hospital-muted">Current Patient Summary</p>
                <h3 className="mt-1 text-2xl font-extrabold text-white">{patient.name}</h3>
              </div>
              <div className="rounded-lg border border-hospital-border bg-hospital-bg/45 px-4 py-3 text-sm">
                <span className="text-hospital-muted">Room</span>
                <span className="ml-2 font-bold text-white">{patient.room}</span>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {vitals.map((vital) => (
                <VitalCard key={vital.label} vital={vital} />
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <h3 className="text-lg font-bold text-white">Immediate Action Checklist</h3>
            <div className="mt-4">
              <Checklist items={checklist} />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="panel p-5">
            <h3 className="text-lg font-bold text-white">Notes</h3>
            <textarea
              className="mt-4 min-h-48 w-full resize-y rounded-lg border border-hospital-border bg-hospital-bg/60 p-4 text-sm text-white placeholder:text-hospital-muted focus-ring"
              placeholder="Add nursing notes. This is a frontend-only placeholder."
            />
            <button
              type="button"
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-lg bg-hospital-blue px-4 py-3 text-sm font-bold text-white hover:bg-blue-500"
            >
              <FiSave className="h-4 w-4" />
              Save Note
            </button>
          </section>

          <section className="panel p-5">
            <h3 className="text-lg font-bold text-white">AI Generated Checklist</h3>
            {aiLoading ? (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45 p-6 text-sm font-semibold text-hospital-muted">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-status-observation" />
                Generating checklist...
              </div>
            ) : aiError ? (
              <div className="mt-4 rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45 p-6 text-center text-sm font-semibold text-status-critical">
                {aiError}
              </div>
            ) : aiChecklist ? (
              <div className="mt-4">
                <div className="mb-3 flex items-center justify-between rounded-lg border border-hospital-border bg-hospital-bg/45 px-4 py-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-hospital-muted">Condition</span>
                  <span className="text-sm font-extrabold text-white">{aiChecklist.condition}</span>
                </div>
                <Checklist items={aiChecklist.items} />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  );
}
