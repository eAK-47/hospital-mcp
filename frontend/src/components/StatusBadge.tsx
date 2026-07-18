import type { PatientStatus } from "../types";

const statusStyles: Record<PatientStatus, string> = {
  Stable: "border-status-stable/40 bg-status-stable/10 text-status-stable",
  Observation: "border-status-observation/40 bg-status-observation/10 text-status-observation",
  Urgent: "border-status-urgent/40 bg-status-urgent/10 text-status-urgent",
  Critical: "border-status-critical/40 bg-status-critical/10 text-status-critical"
};

type StatusBadgeProps = {
  status: PatientStatus;
  size?: "sm" | "md";
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${statusStyles[status]} ${
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      }`}
    >
      {status}
    </span>
  );
}
