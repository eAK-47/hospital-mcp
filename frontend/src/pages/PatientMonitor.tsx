import { useParams } from "react-router-dom";
import ConnectionStatus from "../components/ConnectionStatus";
import ECGChart from "../components/ECGChart";
import Loader from "../components/Loader";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import VitalCard from "../components/VitalCard";
import { mockApi } from "../services/mockApi";
import type { Vital } from "../types";

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
          <div className="mt-6 flex min-h-40 items-center justify-center rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45">
            <Loader />
          </div>
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
