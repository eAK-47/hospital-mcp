import { motion } from "framer-motion";
import type { NotificationItem } from "../types";
import StatusBadge from "./StatusBadge";

type NotificationProps = {
  notification: NotificationItem;
};

export default function Notification({ notification }: NotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-lg border border-hospital-border bg-hospital-bg/70 p-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{notification.title}</p>
          <p className="mt-1 text-sm text-hospital-muted">{notification.message}</p>
        </div>
        <StatusBadge status={notification.status} size="sm" />
      </div>
      <p className="mt-2 text-xs font-semibold text-hospital-muted">{notification.time}</p>
    </motion.div>
  );
}
