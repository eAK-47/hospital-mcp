import ReactMarkdown from "react-markdown";
import ECGChart from "../components/ECGChart";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import VitalCard from "../components/VitalCard";
import { mockApi } from "../services/mockApi";
import type { Vital } from "../types";

export default function DoctorPortal() {
  const patient = mockApi.getPriorityPatient();
  const vitals: Vital[] = [
    { label: "Heart Rate", value: patient.vitals.heartRate, unit: "bpm", trend: "down" },
    { label: "Blood Pressure", value: patient.vitals.bloodPressure, unit: "mmHg", trend: "down" },
    { label: "SpO2", value: patient.vitals.spo2, unit: "%", trend: "down" },
    { label: "Temperature", value: patient.vitals.temperature, unit: "C", trend: "up" },
    { label: "Respiration", value: patient.vitals.respiration, unit: "rpm", trend: "flat" }
  ];

  return (
    <section>
      <PageHeader
        title="Doctor Portal"
        description="Clinical review surface with patient context, vitals, ECG, and AI/MCP recommendation placeholders."
        action={<StatusBadge status={patient.status} />}
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <aside className="panel p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-hospital-border bg-hospital-bg text-3xl font-bold text-hospital-muted">
              {patient.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white">{patient.name}</h3>
              <p className="mt-1 text-sm text-hospital-muted">
                {patient.age} years, {patient.gender}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {[
              ["Blood Group", patient.bloodGroup],
              ["Known Medical History", patient.history.join(", ")],
              ["Current Medications", patient.medications.join(", ")],
              ["Allergies", patient.allergies.join(", ")],
              ["Admission Date", patient.admissionDate]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-hospital-border bg-hospital-bg/45 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-hospital-muted">{label}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white">{value}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          <ECGChart data={patient.ecg} tall />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {vitals.map((vital) => (
              <VitalCard key={vital.label} vital={vital} />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <section className="panel p-5 lg:col-span-1">
              <h3 className="text-lg font-bold text-white">AI Analysis</h3>
              <div className="prose prose-invert mt-4 max-w-none text-sm text-hospital-muted">
                <ReactMarkdown>Waiting for AI Analysis...</ReactMarkdown>
              </div>
            </section>
            <section className="panel p-5 lg:col-span-1">
              <h3 className="text-lg font-bold text-white">Treatment Recommendation</h3>
              <p className="mt-4 text-sm font-semibold text-hospital-muted">Waiting for MCP Recommendation...</p>
            </section>
            <section className="panel p-5 lg:col-span-1">
              <h3 className="text-lg font-bold text-white">AI Confidence</h3>
              <div className="mt-6 flex h-24 items-center justify-center rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45 text-3xl font-extrabold text-hospital-muted">
                --
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
