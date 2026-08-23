import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard, Map, FileText, CheckSquare, Flame,
  MapPin, BarChart2, Zap, ClipboardList, Layers, Settings,
  Menu, X, LogOut, Shield, Scissors
} from "lucide-react";
import { authService } from "@/api/services";
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
  { to: "/authority/abc-campaigns", icon: Scissors, label: "ABC Sterilization" },
  { to: "/authority/layers", icon: Layers, label: "Data Layers" },
  { to: "/authority/settings", icon: Settings, label: "Settings" },
];

export default function AuthorityLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-zinc-50 overflow-hidden font-sans">
      {/* Desktop Sidebar (hidden on small mobile) */}
      <aside className={`hidden md:flex ${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 bg-[#1a2744] flex-col transition-all duration-300 z-40 relative shadow-xl`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {sidebarOpen && (
            <div>
              <Logo onDark size={26} />
              <div className="text-emerald-400 text-[11px] font-mono mt-0.5 tracking-wider uppercase">Authority Command</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors btn-press"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: switch to citizen */}
        <div className="p-3 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
          >
            <Shield className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            {sidebarOpen && <span className="font-medium">Citizen Portal</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer (Slide out) */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#1a2744] z-50 flex flex-col transform transition-transform duration-300 ease-out md:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <Logo onDark size={28} />
            <div className="text-emerald-400 text-xs font-mono mt-0.5">Authority Command</div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-white p-2 rounded-lg bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-3">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 text-sm"
          >
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">Citizen Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/80 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-zinc-600 hover:text-zinc-900 p-2 rounded-lg bg-zinc-100 btn-press"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-mono">
              Noida Pilot
            </span>
            <span className="text-xs text-zinc-500 hidden sm:inline-block">Sector 62 Zone</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <ThemeToggle />
            <span className="font-medium text-xs md:text-sm text-zinc-800">Authority HQ</span>
            <button
              onClick={() => authService.logout("/")}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors btn-press"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}