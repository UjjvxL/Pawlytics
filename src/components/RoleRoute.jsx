import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { authService } from "@/api/services/auth";
import { ShieldAlert, Home } from "lucide-react";
import DemoBanner from "@/components/DemoBanner";

export default function RoleRoute({ requiredRole = "admin" }) {
  const [status, setStatus] = useState("loading");
  const [role, setRole] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authService.me()
      .then((u) => {
        if (cancelled) return;
        setRole(u?.role || "admin");
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setRole("admin");
        setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (role !== requiredRole) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <DemoBanner />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-display mb-2">
            Authority access restricted
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-sm max-w-md mb-6">
            The Authority Dashboard is available to municipal / authority users only.
            Your current account role is{" "}
            <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
              {role || "user"}
            </span>
            . Please request an authority role from your workspace admin, or return to the citizen view.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-medium"
          >
            <Home className="w-4 h-4" /> Back to Citizen View
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}