import { motion } from "framer-motion";
import type { ReactNode } from "react";

type SummaryCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: string;
};

export default function SummaryCard({ label, value, icon, accent = "#2563EB" }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="panel p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-hospital-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg border"
          style={{ color: accent, borderColor: `${accent}66`, backgroundColor: `${accent}1A` }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
