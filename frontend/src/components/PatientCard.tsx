import { motion } from "framer-motion";
import { FiHeart, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import type { Patient } from "../types";
import StatusBadge from "./StatusBadge";

type PatientCardProps = {
  patient: Patient;
};

export default function PatientCard({ patient }: PatientCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} className="panel">
      <Link to={`/monitor/${patient.id}`} className="block p-4 focus-ring">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-white">{patient.name}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-hospital-muted">
              <FiMapPin className="h-4 w-4" />
              <span>{patient.room}</span>
            </div>
          </div>
          <StatusBadge status={patient.status} size="sm" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-hospital-border bg-hospital-bg/45 p-3">
            <div className="flex items-center gap-2 text-sm text-hospital-muted">
              <FiHeart className="h-4 w-4 text-status-critical" />
              Heart Rate
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{patient.vitals.heartRate}</p>
            <p className="text-xs font-semibold text-hospital-muted">bpm</p>
          </div>
          <div className="rounded-lg border border-hospital-border bg-hospital-bg/45 p-3">
            <p className="text-sm text-hospital-muted">Current Status</p>
            <p className="mt-2 text-base font-bold text-white">{patient.condition}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
