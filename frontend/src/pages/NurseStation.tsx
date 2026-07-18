import { motion } from "framer-motion";
import { FiAlertOctagon, FiSave } from "react-icons/fi";
import Checklist from "../components/Checklist";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import VitalCard from "../components/VitalCard";
import { mockApi } from "../services/mockApi";
import type { Vital } from "../types";

export default function NurseStation() {
  const patient = mockApi.getPriorityPatient();
  const checklist = mockApi.getChecklist();
  const vitals: Vital[] = [
    { label: "Heart Rate", value: patient.vitals.heartRate, unit: "bpm", trend: "down" },
    { label: "Blood Pressure", value: patient.vitals.bloodPressure, unit: "mmHg", trend: "down" },
    { label: "SpO2", value: patient.vitals.spo2, unit: "%", trend: "down" },
    { label: "Temperature", value: patient.vitals.temperature, unit: "C", trend: "up" }
  ];

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
            <div className="mt-4 rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45 p-6 text-center text-sm font-semibold text-hospital-muted">
              Waiting for MCP Server...
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
