import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RISK_LEVELS, calculateRiskScore, CONFIDENCE_LEVELS } from "@/lib/riskEngine";
import RiskBadge, { ConfidenceBadge } from "@/components/RiskBadge";
import { MapPin, TrendingUp } from "lucide-react";

const WARD_LIST = [
  "Sector 62 Noida",
  "Sector 18 Atta Market",
  "Sector 37 Noida",
  "Sector 50 Noida",
  "Sector 93 Noida",
  "Sector 12 Noida",
];

export default function WardsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Report.filter({ is_demo: true }).then(r => {
      setReports(r);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" /></div>;
  }

  const wardStats = WARD_LIST.map(ward => {
    const wardReports = reports.filter(r => r.ward === ward);
    const risk = calculateRiskScore(wardReports);
    const bites = wardReports.filter(r => r.severity_level === 5).length;
    const biteVerified = wardReports.filter(r => r.severity_level === 5 && r.verification_status === "verified").length;
    return { ward, ...risk, total: wardReports.length, bites, biteVerified };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">Wards / Sectors</h1>
        <p className="text-slate-500 text-sm mt-1">Risk summary per sector — Sector 62 Zone Pilot</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        Areas with insufficient data are shown as "Unknown risk." Absence of reports does not indicate absence of risk.
      </div>

      <div className="space-y-3">
        {wardStats.map((w, i) => {
          const cfg = RISK_LEVELS[w.level] || RISK_LEVELS.unknown;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: cfg.color + "20" }}>
                    <MapPin className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{w.ward}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Bengaluru · Pilot Zone</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <RiskBadge level={w.level} />
                  <ConfidenceBadge confidence={w.confidence} size="sm" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-3">
                {[
                  { label: "Total Reports", value: w.total },
                  { label: "Verified", value: w.verifiedCount || 0 },
                  { label: "Bite/Contact", value: w.bites },
                  { label: "Risk Score", value: w.level === "unknown" ? "—" : `${w.score}/100` },
                ].map((m, j) => (
                  <div key={j} className="text-center bg-slate-50 rounded-lg p-2">
                    <div className="font-bold text-slate-800 text-sm">{m.value}</div>
                    <div className="text-xs text-slate-500">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Risk bar */}
              <div className="mb-2">
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${w.level === "unknown" ? 0 : w.score}%`, backgroundColor: cfg.color }} />
                </div>
              </div>

              {/* Explanation */}
              {w.explanation?.length > 0 && (
                <div className="mt-2 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600 border border-slate-200">
                  <span className="font-medium">Risk factors: </span>
                  {w.explanation.join(", ")}
                </div>
              )}
              {w.level === "unknown" && (
                <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 border border-gray-200">
                  Insufficient verified reports to estimate risk reliably for this area.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}