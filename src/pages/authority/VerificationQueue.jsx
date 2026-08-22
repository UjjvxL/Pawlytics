import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/riskEngine";
import { CheckCircle, XCircle, Copy, ChevronDown, AlertTriangle } from "lucide-react";

const TRUST_LABELS = { 1.0: { label: "Established", color: "text-green-600" }, 0.7: { label: "New Reporter", color: "text-amber-500" }, 0.5: { label: "Flagged", color: "text-red-500" } };

function getTrustLabel(weight) {
  if (weight >= 1.0) return TRUST_LABELS[1.0];
  if (weight >= 0.7) return TRUST_LABELS[0.7];
  return TRUST_LABELS[0.5];
}

export default function VerificationQueue() {
  const [reports, setReports] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [notes, setNotes] = useState({});
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    base44.entities.Report.filter({ is_demo: true })
      .then(r => {
        setReports(r.sort((a, b) => b.severity_level - a.severity_level));
        setLoading(false);
      });
  }, []);

  const filtered = reports.filter(r => {
    if (filter === "pending") return r.verification_status === "pending";
    if (filter === "verified") return r.verification_status === "verified";
    if (filter === "rejected") return r.verification_status === "rejected" || r.status === "duplicate";
    return true;
  });

  const handleDecision = async (reportId, decision) => {
    setProcessing(reportId);
    const statusMap = { verified: { status: "verified", verification_status: "verified" }, rejected: { status: "rejected", verification_status: "rejected" }, duplicate: { status: "duplicate", verification_status: "rejected" } };
    try {
      await base44.entities.Report.update(reportId, {
        ...statusMap[decision],
        moderator_notes: notes[reportId] || "",
      });
      await base44.entities.Verification.create({
        report_id: reportId,
        reviewer_name: "Authority Demo User",
        decision,
        notes: notes[reportId] || "",
        is_demo: true,
      });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, ...statusMap[decision] } : r));
      setExpanded(null);
    } catch (e) { console.error(e); }
    setProcessing(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" /></div>;
  }

  const pendingCount = reports.filter(r => r.verification_status === "pending").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">Verification Queue</h1>
          <p className="text-slate-500 text-sm mt-1">{pendingCount} report{pendingCount !== 1 ? 's' : ''} awaiting review</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[["pending", "Pending"], ["verified", "Verified"], ["rejected", "Rejected / Duplicate"], ["all", "All"]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {l} {v === "pending" && pendingCount > 0 && <span className="ml-1 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
          </button>
        ))}
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {filtered.slice(0, 20).map((report, i) => {
          const sev = SEVERITY_LABELS[report.severity_level];
          const isExpanded = expanded === report.id;
          const trust = getTrustLabel(report.trust_weight || 1.0);
          const hasCv = report.cv_status !== "no_image";
          const isPotentialDuplicate = report.status === "duplicate";

          return (
            <div key={i} className={`bg-white rounded-xl border transition-all ${isExpanded ? "border-blue-300 shadow-md" : "border-slate-200"}`}>
              <div
                className="flex items-start gap-4 p-4 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : report.id)}
              >
                {/* Severity indicator */}
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: sev?.color || "#6B7280" }} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{CATEGORY_LABELS[report.category]}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{report.location_label} · {new Date(report.incident_timestamp).toLocaleString("en-IN")}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isPotentialDuplicate && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">Possible Duplicate</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        report.verification_status === "verified" ? "bg-green-100 text-green-700" :
                        report.verification_status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {report.verification_status === "verified" ? "✓ Verified" :
                         report.verification_status === "rejected" ? "✗ Rejected" :
                         "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs font-medium font-mono" style={{ color: sev?.color }}>{sev?.label}</span>
                    <span className={`text-xs font-medium ${trust.color}`}>Reporter: {trust.label}</span>
                    {hasCv && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${report.cv_status === "low_confidence" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}`}>
                        CV: {report.cv_dog_count} dog{report.cv_dog_count !== 1 ? 's' : ''} ({Math.round(report.cv_confidence * 100)}%)
                      </span>
                    )}
                    {report.context_tags?.map((tag, j) => (
                      <span key={j} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tag.replace("_", " ")}</span>
                    ))}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100">
                  <div className="mt-3 space-y-3">
                    {/* Description */}
                    {report.description && (
                      <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <div className="text-xs font-medium text-slate-500 mb-1">Reporter's Description</div>
                        <div className="text-sm text-slate-700">{report.description}</div>
                      </div>
                    )}

                    {/* CV Analysis */}
                    {hasCv && (
                      <div className="bg-slate-800 rounded-lg px-3 py-2 text-white">
                        <div className="text-xs font-medium text-slate-400 mb-1">CV Analysis [Prototype Architecture]</div>
                        <div className="text-sm font-semibold">{report.cv_dog_count} dog{report.cv_dog_count !== 1 ? 's' : ''} detected</div>
                        <div className="text-xs text-slate-300">Confidence: {Math.round(report.cv_confidence * 100)}% · Group: {report.cv_group_detected ? "Detected" : "Not detected"}</div>
                        {report.cv_status === "low_confidence" && (
                          <div className="text-xs text-yellow-300 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low confidence — human review required
                          </div>
                        )}
                        <div className="text-xs text-slate-500 mt-1">
                          No aggression inference from image. CV provides dog count + group detection only.
                        </div>
                      </div>
                    )}

                    {/* Moderator notes */}
                    {report.verification_status === "pending" && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">Moderator Note (optional)</label>
                          <textarea
                            value={notes[report.id] || ""}
                            onChange={e => setNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                            placeholder="Add a note about this decision..."
                            rows={2}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(report.id, "verified")}
                            disabled={processing === report.id}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                          >
                            <CheckCircle className="w-4 h-4" /> Verify
                          </button>
                          <button
                            onClick={() => handleDecision(report.id, "rejected")}
                            disabled={processing === report.id}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                          <button
                            onClick={() => handleDecision(report.id, "duplicate")}
                            disabled={processing === report.id}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-60"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <div className="text-slate-500 font-medium">Queue is clear</div>
            <div className="text-slate-400 text-sm">No {filter} reports to show</div>
          </div>
        )}
      </div>
    </div>
  );
}