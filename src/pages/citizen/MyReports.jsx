import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CATEGORY_LABELS, SEVERITY_LABELS, RISK_LEVELS } from "@/lib/riskEngine";
import { FileText, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import DemoBanner from "@/components/DemoBanner";

const STATUS_CONFIG = {
  under_review: { label: "Under Review", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  verified: { label: "Verified", icon: CheckCircle, color: "text-green-700 bg-green-50 border-green-200" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
  duplicate: { label: "Duplicate", icon: AlertTriangle, color: "text-slate-500 bg-slate-50 border-slate-200" },
};

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Report.filter({ is_demo: true })
      .then(r => {
        setReports(r.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 20));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner />
      <div className="bg-[#1a2744] px-4 pt-10 pb-5 text-white">
        <div className="font-bold text-xl font-display mb-1">My Reports</div>
        <div className="text-blue-300 text-sm">{reports.length} demo reports in the pilot area</div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {reports.map((report, i) => {
          const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.under_review;
          const StatusIcon = status.icon;
          const severity = SEVERITY_LABELS[report.severity_level];

          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{CATEGORY_LABELS[report.category]}</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span style={{ color: severity?.color }} className="font-medium">{severity?.short}</span>
                    <span>·</span>
                    <span>{report.location_label}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border flex items-center gap-1 ${status.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>

              {report.description && (
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{report.description}</p>
              )}

              <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
                <span>📅 {new Date(report.incident_timestamp).toLocaleDateString("en-IN")}</span>
                {report.dog_count > 1 && <span>🐕 {report.dog_count} dogs</span>}
                {report.cv_status === "processed" && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full">CV: {Math.round(report.cv_confidence * 100)}% conf.</span>
                )}
                {report.is_demo && <span className="demo-badge">Demo</span>}
              </div>
            </div>
          );
        })}

        {reports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-slate-500 font-medium">No reports yet</div>
            <div className="text-slate-400 text-sm mt-1">Your submitted reports will appear here</div>
          </div>
        )}
      </div>
    </div>
  );
}