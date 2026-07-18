import { FiActivity, FiArrowDown, FiArrowRight, FiArrowUp } from "react-icons/fi";
import type { Vital } from "../types";

type VitalCardProps = {
  vital: Vital;
};

export default function VitalCard({ vital }: VitalCardProps) {
  const TrendIcon = vital.trend === "up" ? FiArrowUp : vital.trend === "down" ? FiArrowDown : FiArrowRight;

  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-hospital-muted">{vital.label}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{vital.value}</span>
            {vital.unit ? <span className="text-sm font-semibold text-hospital-muted">{vital.unit}</span> : null}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-hospital-border bg-hospital-bg/50 text-hospital-blue">
          <FiActivity className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-hospital-muted">
        <TrendIcon className="h-4 w-4" />
        Live placeholder
      </div>
    </div>
  );
}
