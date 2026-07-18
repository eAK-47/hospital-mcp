import { FiCircle } from "react-icons/fi";
import type { ConnectionStatus as ConnectionStatusType } from "../types";

type ConnectionStatusProps = {
  status: ConnectionStatusType;
  compact?: boolean;
};

export default function ConnectionStatus({ status, compact = false }: ConnectionStatusProps) {
  const dotClass =
    status.state === "Online"
      ? "text-status-stable"
      : status.state === "Offline"
        ? "text-status-critical"
        : "text-status-observation";

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md border border-hospital-border bg-hospital-bg/45 ${
        compact ? "px-2.5 py-2" : "px-4 py-3"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <FiCircle className={`h-3 w-3 shrink-0 fill-current ${dotClass}`} />
        <span className="truncate text-sm font-medium text-white">{status.name}</span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-hospital-muted">{status.state}</span>
    </div>
  );
}
