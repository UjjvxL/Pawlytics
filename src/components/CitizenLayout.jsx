import { Outlet, NavLink } from "react-router-dom";
import { Home, Map, Plus, Navigation, FileText } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/map", icon: Map, label: "Map" },
  { to: "/report", icon: Plus, label: "Report", primary: true },
  { to: "/routes", icon: Navigation, label: "Routes" },
  { to: "/my-reports", icon: FileText, label: "Mine" },
];

export default function CitizenLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label, primary }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                primary
                  ? "flex flex-col items-center gap-0.5 -mt-5"
                  : `flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors ${isActive ? "text-blue-900" : "text-slate-400 hover:text-slate-600"}`
              }
            >
              {({ isActive }) => (
                primary ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center shadow-lg shadow-blue-900/30 border-4 border-slate-50">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-blue-900">{label}</span>
                  </div>
                ) : (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-900" : ""}`} />
                    <span className={`text-xs font-medium ${isActive ? "text-blue-900" : ""}`}>{label}</span>
                    {isActive && <span className="w-1 h-1 rounded-full bg-blue-900 absolute bottom-1" />}
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