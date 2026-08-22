import { useEffect, useState } from "react";
import HistoryCard from "../components/HistoryCard";
import PageHeader from "../components/PageHeader";
import Timeline from "../components/Timeline";
import { mockApi } from "../services/mockApi";
import type { HistoryEvent, Patient } from "../types";

export default function PatientHistory() {
  const patients = mockApi.getPatients();
  const [selectedId, setSelectedId] = useState<string>(patients[0]?.id || "");
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedPatient = patients.find((p: Patient) => p.id === selectedId) ?? patients[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const data = await mockApi.fetchHistory(selectedId);
        if (!cancelled) setEvents(data);
      } catch (error) {
        console.warn("Failed to load history:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <section>
      <PageHeader
        title="Patient History"
        description="Chronological ICU event timeline from real telemetry records."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-hospital-border bg-hospital-bg/45 p-4">
        <span className="text-sm font-bold uppercase tracking-wide text-hospital-muted">
          Select Patient
        </span>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="focus-ring rounded-lg border border-hospital-border bg-hospital-bg px-4 py-2 text-sm font-semibold text-white"
        >
          {patients.map((p: Patient) => (
            <option key={p.id} value={p.id}>
              {p.id} — {p.name}
            </option>
          ))}
        </select>
        {selectedPatient && (
          <span className="ml-auto text-sm font-semibold text-hospital-muted">
            {selectedPatient.name} · {selectedPatient.age} yrs · {selectedPatient.room}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45">
          <div className="flex items-center gap-3 text-sm font-semibold text-hospital-muted">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-status-observation" />
            Loading history...
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-hospital-border bg-hospital-bg/45">
          <p className="text-sm font-semibold text-hospital-muted">No history events recorded for this patient.</p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <Timeline events={events} />
          <aside className="space-y-4">
            {events.slice(-3).map((event) => (
              <HistoryCard key={event.id} event={event} />
            ))}
          </aside>
        </div>
      )}
    </section>
  );
}