import { useEffect, useMemo, useState } from "react";
import { FiBell, FiShield } from "react-icons/fi";
import { mockApi } from "../services/mockApi";
import ConnectionStatus from "./ConnectionStatus";

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return {
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })
  };
}

export default function Navbar() {
  const { time, date } = useClock();
  const statuses = useMemo(() => mockApi.getConnections().slice(0, 4), []);

  return (
    <header className="sticky top-0 z-40 border-b border-hospital-border bg-hospital-bg/92 backdrop-blur">
      <div className="flex min-h-20 flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-hospital-blue/45 bg-hospital-blue/15 text-hospital-blue">
            <FiShield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-hospital-muted">Hospital Command Center</p>
            <h1 className="text-xl font-extrabold text-white sm:text-2xl">ICU Guardian AI</h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {statuses.map((status) => (
              <ConnectionStatus key={status.name} status={status} compact />
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-hospital-border bg-hospital-card px-4 py-3">
            <div>
              <p className="text-lg font-bold text-white">{time}</p>
              <p className="text-xs font-medium text-hospital-muted">{date}</p>
            </div>
            <button type="button" className="focus-ring rounded-lg border border-hospital-border p-2 text-hospital-muted hover:text-white">
              <FiBell className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
