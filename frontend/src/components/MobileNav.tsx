import { NavLink } from "react-router-dom";
import { FiActivity, FiClipboard, FiClock, FiCpu, FiGrid, FiUserCheck } from "react-icons/fi";

const navItems = [
  { label: "Dashboard", href: "/", icon: FiGrid },
  { label: "Monitor", href: "/monitor", icon: FiActivity },
  { label: "Nurse", href: "/nurse-station", icon: FiClipboard },
  { label: "Doctor", href: "/doctor-portal", icon: FiUserCheck },
  { label: "History", href: "/history", icon: FiClock },
  { label: "Status", href: "/system-status", icon: FiCpu }
];

export default function MobileNav() {
  return (
    <nav className="mb-4 grid grid-cols-3 gap-2 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) =>
              `focus-ring flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                isActive
                  ? "border-hospital-blue/50 bg-hospital-blue/15 text-white"
                  : "border-hospital-border bg-hospital-card text-hospital-muted"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
