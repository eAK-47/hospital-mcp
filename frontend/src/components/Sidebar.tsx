import { NavLink } from "react-router-dom";
import {
  FiActivity,
  FiClipboard,
  FiClock,
  FiCpu,
  FiGrid,
  FiUserCheck
} from "react-icons/fi";

const navItems = [
  { label: "Dashboard", href: "/", icon: FiGrid },
  { label: "Patient Monitor", href: "/monitor", icon: FiActivity },
  { label: "Nurse Station", href: "/nurse-station", icon: FiClipboard },
  { label: "Doctor Portal", href: "/doctor-portal", icon: FiUserCheck },
  { label: "Patient History", href: "/history", icon: FiClock },
  { label: "System Status", href: "/system-status", icon: FiCpu }
];

export default function Sidebar() {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-80px)] w-64 shrink-0 border-r border-hospital-border bg-hospital-bg/80 p-4 lg:block">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border border-hospital-blue/45 bg-hospital-blue/15 text-white"
                    : "text-hospital-muted hover:bg-hospital-card hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
