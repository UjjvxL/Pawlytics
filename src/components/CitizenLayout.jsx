import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Map, Plus, Navigation, FileText } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/map", icon: Map, label: "Map" },
  { to: "/report", icon: Plus, label: "Report", primary: true },
  { to: "/routes", icon: Navigation, label: "Routes" },
  { to: "/my-reports", icon: FileText, label: "Mine" },
];

export default function CitizenLayout() {
  const location = useLocation();
  const isFullMapPage = location.pathname === "/map";

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-zinc-50">
      <main className={`flex-1 ${isFullMapPage ? "pb-16 h-[calc(100dvh-4rem)] overflow-hidden" : "pb-20 overflow-y-auto"}`}>
        <Outlet />
      </main>

      {/* Bottom nav — iOS safe area aware with high z-index (z-[3000]) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-200/60 z-[3000]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label, primary }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                primary
                  ? "flex flex-col items-center gap-0.5 -mt-5"
                  : `flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200 ${isActive ? "text-emerald-600 bg-emerald-50" : "text-zinc-400 hover:text-zinc-600 active:scale-95"}`
              }
            >
              {({ isActive }) => (
                primary ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-14 h-14 rounded-2xl bg-[#1a2744] flex items-center justify-center shadow-lg shadow-[#1a2744]/25 border-4 border-zinc-50 btn-press">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#1a2744] tracking-wide">{label}</span>
                  </div>
                ) : (
                  <>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-600" : ""}`} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span className={`text-[10px] font-medium tracking-wide ${isActive ? "text-emerald-600" : ""}`}>{label}</span>
                  </>
                )
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}