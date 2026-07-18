import type { HistoryEvent } from "../types";
import StatusBadge from "./StatusBadge";

type HistoryCardProps = {
  event: HistoryEvent;
};

export default function HistoryCard({ event }: HistoryCardProps) {
  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-hospital-muted">{event.time}</p>
          <h3 className="mt-1 text-lg font-bold text-white">{event.title}</h3>
        </div>
        <StatusBadge status={event.status} size="sm" />
      </div>
      <p className="mt-3 text-sm leading-6 text-hospital-muted">{event.description}</p>
    </article>
  );
}
