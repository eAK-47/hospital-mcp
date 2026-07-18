import { FiActivity, FiAlertTriangle, FiEye, FiUsers } from "react-icons/fi";
import PageHeader from "../components/PageHeader";
import PatientCard from "../components/PatientCard";
import SummaryCard from "../components/SummaryCard";
import { mockApi } from "../services/mockApi";
import type { PatientStatus } from "../types";

export default function Dashboard() {
  const patients = mockApi.getPatients();
  const countByStatus = (status: PatientStatus) => patients.filter((patient) => patient.status === status).length;

  return (
    <section>
      <PageHeader
        title="ICU Patient Overview"
        description="Quick operational view of ICU patients using local dummy data. Patient cards are ready to receive realtime telemetry later."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Patients" value={patients.length} icon={<FiUsers className="h-5 w-5" />} />
        <SummaryCard label="Stable" value={countByStatus("Stable")} icon={<FiActivity className="h-5 w-5" />} accent="#22C55E" />
        <SummaryCard
          label="Observation"
          value={countByStatus("Observation")}
          icon={<FiEye className="h-5 w-5" />}
          accent="#FACC15"
        />
        <SummaryCard
          label="Critical"
          value={countByStatus("Critical")}
          icon={<FiAlertTriangle className="h-5 w-5" />}
          accent="#EF4444"
        />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </section>
  );
}
