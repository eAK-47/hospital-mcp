import type { HistoryEvent } from "../types";
import StatusBadge from "./StatusBadge";

type TimelineProps = {
  events: HistoryEvent[];
};

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="panel p-5">
      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={event.id} className="grid grid-cols-[84px_24px_1fr] gap-4">
            <div className="pt-1 text-sm font-semibold text-hospital-muted">{event.time}</div>
            <div className="relative flex justify-center">
              <span className="mt-2 h-3 w-3 rounded-full bg-hospital-blue ring-4 ring-hospital-blue/15" />
              {index !== events.length - 1 ? <span className="absolute top-6 h-full w-px bg-hospital-border" /> : null}
            </div>
            <div className="pb-7">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-white">{event.title}</h3>
                <StatusBadge status={event.status} size="sm" />
              </div>
              <p className="mt-2 text-sm leading-6 text-hospital-muted">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
