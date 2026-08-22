import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import ECGChart from "../components/ECGChart";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import VitalCard from "../components/VitalCard";
import { mockApi } from "../services/mockApi";
import type { Vital } from "../types";

type AiRecommendation = {
  patient_id: string;
  condition: string;
  confidence: number;
  summary: string;
  actions: string[];
  doctor_brief: string;
};

export default function DoctorPortal() {
  const patient = mockApi.getPriorityPatient();
  const vitals: Vital[] = [
    { label: "Heart Rate", value: patient.vitals.heartRate, unit: "bpm", trend: "down" },
    { label: "Blood Pressure", value: patient.vitals.bloodPressure, unit: "mmHg", trend: "down" },
    { label: "SpO2", value: patient.vitals.spo2, unit: "%", trend: "down" },
    { label: "Temperature", value: patient.vitals.temperature, unit: "C", trend: "up" },
    { label: "Respiration", value: patient.vitals.respiration, unit: "rpm", trend: "flat" }
  ];

  const [ai, setAi] = useState<AiRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAi() {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3001";
        const response = await fetch(
          `${baseUrl}/api/ai/recommendation?patientId=${encodeURIComponent(patient.id)}`
        );
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setAi(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load AI recommendation");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAi();
    const interval = setInterval(loadAi, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [patient.id]);

  // Get doctor brief from patient data (populated from database)
  const doctorBrief = (patient as any).doctor_brief || "Waiting for AI Analysis...";

  const confidenceColor =
    ai && ai.confidence >= 90
      ? "text-status-critical"
      : ai && ai.confidence >= 75
        ? "text-status-observation"
        : "text-status-stable";

  return (
    <section>
      <PageHeader
        title="Doctor Portal"
        description="Clinical review surface with patient context, vitals, ECG, and AI-powered recommendations."
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
                <ReactMarkdown>{doctorBrief}</ReactMarkdown>
              </div>
            </section>
            <section className="panel p-5 lg:col-span-1">
              <h3 className="text-lg font-bold text-white">Treatment Recommendation</h3>
              {loading ? (
                <div className="mt-4 flex items-center gap-3 text-sm font-semibold text-hospital-muted">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-status-observation" />
                  Analyzing vitals...
                </div>
              ) : error ? (
                <p className="mt-4 text-sm font-semibold text-status-critical">{error}</p>
              ) : ai ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-hospital-muted">Detected Condition</p>
                    <p className="mt-1 text-lg font-extrabold text-white">{ai.condition}</p>
                  </div>
                  <p className="text-sm leading-6 text-hospital-muted">{ai.summary}</p>
                  <ul className="space-y-2">
                    {ai.actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-white">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-hospital-blue" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
            <section className="panel p-5 lg:col-span-1">
              <h3 className="text-lg font-bold text-white">AI Confidence</h3>
              {loading ? (
                <div className="mt-6 flex h-24 items-center justify-center rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45">
                  <div className="flex items-center gap-3 text-sm font-semibold text-hospital-muted">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-status-observation" />
                    Calculating...
                  </div>
                </div>
              ) : error ? (
                <div className="mt-6 flex h-24 items-center justify-center rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45">
                  <p className="text-sm font-semibold text-status-critical">Unavailable</p>
                </div>
              ) : ai ? (
                <div className="mt-6">
                  <div className="flex h-24 items-center justify-center rounded-lg border border-hospital-border bg-hospital-bg/45">
                    <span className={`text-4xl font-extrabold ${confidenceColor}`}>
                      {ai.confidence}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-hospital-bg">
                      <div
                        className={`h-full rounded-full ${
                          ai.confidence >= 90
                            ? "bg-status-critical"
                            : ai.confidence >= 75
                              ? "bg-status-observation"
                              : "bg-status-stable"
                        }`}
                        style={{ width: `${ai.confidence}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-hospital-muted">
                      {ai.confidence >= 90
                        ? "High confidence — immediate action required"
                        : ai.confidence >= 75
                          ? "Moderate confidence — verify before acting"
                          : "Low confidence — seek second opinion"}
                    </p>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}