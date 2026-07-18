import HistoryCard from "../components/HistoryCard";
import PageHeader from "../components/PageHeader";
import Timeline from "../components/Timeline";
import { mockApi } from "../services/mockApi";

export default function PatientHistory() {
  const patient = mockApi.getPriorityPatient();
  const events = mockApi.getHistory(patient.id);

  return (
    <section>
      <PageHeader
        title="Patient History"
        description="Chronological ICU event timeline using dummy patient history. Future data can come from backend records through the service layer."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Timeline events={events} />
        <aside className="space-y-4">
          {events.slice(-3).map((event) => (
            <HistoryCard key={event.id} event={event} />
          ))}
        </aside>
      </div>
    </section>
  );
}
