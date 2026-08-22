import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard, Map, FileText, CheckSquare, Flame,
  MapPin, BarChart2, Zap, ClipboardList, Layers, Settings,
  Menu, X, LogOut, Shield
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { to: "/authority", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/authority/map", icon: Map, label: "Live Risk Map" },
  { to: "/authority/reports", icon: FileText, label: "Reports" },
  { to: "/authority/queue", icon: CheckSquare, label: "Verification Queue" },
  { to: "/authority/hotspots", icon: Flame, label: "Hotspots" },
  { to: "/authority/wards", icon: MapPin, label: "Wards / Sectors" },
  { to: "/authority/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/authority/actions", icon: Zap, label: "Actions" },
  { to: "/authority/compliance", icon: ClipboardList, label: "Compliance Reports" },
  { to: "/authority/layers", icon: Layers, label: "Data Layers" },
  { to: "/authority/settings", icon: Settings, label: "Settings" },
];

export default function AuthorityLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} flex-shrink-0 bg-[#1a2744] flex flex-col transition-all duration-200 z-40`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {sidebarOpen && (
            <div>
              <Logo onDark size={28} />
              <div className="text-blue-300 text-xs mt-1">Authority Dashboard</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-0.5 px-2">
            {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-white/15 text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-white/8"
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom: switch to citizen */}
        <div className="p-3 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 text-sm transition-colors"
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Citizen View</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Demo / Pilot Data
            </span>
            <span className="text-xs text-slate-500">Noida Pilot — Sector 62 Zone</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <ThemeToggle />
            <span className="font-medium">Authority User</span>
            <button
              onClick={() => base44.auth.logout("/")}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}