import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import type { ChecklistItem } from "../types";

type ChecklistProps = {
  items: ChecklistItem[];
};

export default function Checklist({ items }: ChecklistProps) {
  const [completed, setCompleted] = useState<string[]>([]);

  function toggle(id: string) {
    setCompleted((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isComplete = completed.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            className={`focus-ring flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
              isComplete
                ? "border-status-stable/40 bg-status-stable/10 text-status-stable"
                : "border-hospital-border bg-hospital-bg/45 text-white hover:border-hospital-blue/60"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                isComplete ? "border-status-stable bg-status-stable text-hospital-bg" : "border-hospital-border"
              }`}
            >
              {isComplete ? <FiCheck className="h-4 w-4" /> : null}
            </span>
            <span className="font-semibold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
