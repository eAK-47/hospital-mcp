import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConnectionStatus from "../components/ConnectionStatus";
import ECGChart from "../components/ECGChart";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import VitalCard from "../components/VitalCard";
import { mockApi } from "../services/mockApi";
import type { Vital } from "../types";

type TelemetryRow = {
  id: string;
  patient_id: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  blood_pressure: { systolic: number; diastolic: number };
  status: string;
  created_at: string;
};

function patientVitals(patient: ReturnType<typeof mockApi.getPatient>): Vital[] {
  return [
    { label: "Heart Rate", value: patient.vitals.heartRate, unit: "bpm", trend: "down" },
    { label: "Blood Pressure", value: patient.vitals.bloodPressure, unit: "mmHg", trend: "down" },
    { label: "SpO2", value: patient.vitals.spo2, unit: "%", trend: "down" },
    { label: "Temperature", value: patient.vitals.temperature, unit: "C", trend: "up" },
    { label: "Respiration", value: patient.vitals.respiration, unit: "rpm", trend: "flat" }
  ];
}

export default function PatientMonitor() {
  const { patientId } = useParams();
  const patient = mockApi.getPatient(patientId);
  const connections = mockApi.getConnections().slice(0, 4);

  const [telemetry, setTelemetry] = useState<TelemetryRow[]>([]);
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTelemetry() {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3001";
        const response = await fetch(
          `${baseUrl}/api/telemetry/latest?patientId=${encodeURIComponent(patientId || "402")}`
        );
        if (!response.ok) throw new Error(`Backend responded with ${response.status}`);
        const rows = await response.json();
        if (!cancelled) {
          setTelemetry(rows);
          setFeedError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setFeedError(error instanceof Error ? error.message : "Failed to load telemetry");
        }
      }
    }

    loadTelemetry();
    const interval = setInterval(loadTelemetry, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [patientId]);

  return (
    <section>
      <PageHeader
        title="Patient Monitor"
        description="Detailed patient monitoring surface prepared for future simulator and backend telemetry."
        action={<StatusBadge status={patient.status} />}
      />

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="panel p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-hospital-border bg-hospital-bg text-2xl font-bold text-hospital-muted">
              {patient.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold text-white">{patient.name}</h3>
              <p className="mt-1 text-sm text-hospital-muted">{patient.condition}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {[
              ["Age", patient.age],
              ["Gender", patient.gender],
              ["Room", patient.room],
              ["Patient ID", patient.id],
              ["Blood Group", patient.bloodGroup],
              ["Admission", patient.admissionDate]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-hospital-border bg-hospital-bg/45 p-3">
                <dt className="text-hospital-muted">{label}</dt>
                <dd className="mt-1 font-bold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {patientVitals(patient).map((vital) => (
              <VitalCard key={vital.label} vital={vital} />
            ))}
          </div>
          <ECGChart data={patient.ecg} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="panel p-5">
          <h3 className="text-lg font-bold text-white">Live Simulator Feed</h3>
          {feedError ? (
            <div className="mt-6 flex min-h-40 items-center justify-center rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45">
              <div className="text-center">
                <p className="text-sm font-semibold text-status-critical">Backend unreachable</p>
                <p className="mt-1 text-xs text-hospital-muted">{feedError}</p>
              </div>
            </div>
          ) : telemetry.length === 0 ? (
            <div className="mt-6 flex min-h-40 items-center justify-center rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45">
              <div className="flex items-center gap-3 text-sm font-semibold text-hospital-muted">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-status-observation" />
                Waiting for telemetry data...
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {telemetry.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-hospital-border bg-hospital-bg/45 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      HR {row.heart_rate} bpm · SpO₂ {row.spo2}% · Temp {row.temperature}°C
                    </p>
                    <p className="mt-1 text-xs text-hospital-muted">
                      BP {row.blood_pressure?.systolic}/{row.blood_pressure?.diastolic} mmHg ·{" "}
                      {new Date(row.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                  <StatusBadge
                    status={
                      row.status === "CRITICAL"
                        ? "Critical"
                        : row.status === "WARNING"
                          ? "Urgent"
                          : "Stable"
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="panel p-5">
          <h3 className="text-lg font-bold text-white">Connection Panel</h3>
          <div className="mt-4 space-y-3">
            {connections.map((status) => (
              <ConnectionStatus key={status.name} status={status} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
