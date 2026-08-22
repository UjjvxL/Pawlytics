import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RISK_LEVELS } from "@/lib/riskEngine";
import RiskBadge, { ConfidenceBadge } from "@/components/RiskBadge";
import { Flame, Clock, AlertTriangle, Plus } from "lucide-react";

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState(30);
  const [addingAction, setAddingAction] = useState(null);
  const [actionForm, setActionForm] = useState({ action_type: "", note: "" });

  useEffect(() => {
    Promise.all([
      base44.entities.Hotspot.filter({ is_demo: true }),
      base44.entities.AuthorityAction.filter({ is_demo: true }),
    ]).then(([h, a]) => {
      setHotspots(h.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)));
      setActions(a);
      setLoading(false);
    });
  }, []);

  const handleAddAction = async (hotspot) => {
    if (!actionForm.action_type) return;
    const created = await base44.entities.AuthorityAction.create({
      hotspot_id: hotspot.id,
      authority_name: "Authority Demo User",
      action_type: actionForm.action_type,
      note: actionForm.note,
      location_label: hotspot.ward,
      status: "pending",
      is_demo: true,
    });
    setActions(prev => [created, ...prev]);
    setAddingAction(null);
    setActionForm({ action_type: "", note: "" });
  };

  const ACTION_TYPES = [
    { value: "field_inspection_scheduled", label: "Field Inspection Scheduled" },
    { value: "abc_team_notified", label: "ABC Team Notified" },
    { value: "waste_issue_reported", label: "Waste Issue Reported" },
    { value: "area_inspection_completed", label: "Area Inspection Completed" },
    { value: "public_warning_issued", label: "Public Warning Issued" },
    { value: "feeding_zone_review", label: "Feeding Zone Review" },
    { value: "sterilization_drive_scheduled", label: "Sterilization Drive Scheduled" },
    { value: "other", label: "Other" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">Active Hotspots</h1>
          <p className="text-slate-500 text-sm mt-1">{hotspots.filter(h => h.is_active).length} active · backward-looking cluster analysis</p>
        </div>
        <div className="flex gap-1">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setTimeWindow(d)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${timeWindow === d ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600"}`}>{d}d</button>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          Hotspot analysis is <strong>backward-looking</strong> — based on verified reports in the selected time window using spatial clustering.
          This is not predictive. A minimum of {3} verified reports are required to form a hotspot.
        </div>
      </div>

      <div className="space-y-4">
        {hotspots.map((h, i) => {
          const cfg = RISK_LEVELS[h.risk_level] || RISK_LEVELS.unknown;
          const hotspotActions = actions.filter(a => a.hotspot_id === h.id || a.location_label === h.ward);

          return (
            <div key={i} className={`bg-white rounded-2xl border-2 overflow-hidden ${h.risk_level === "high" || h.risk_level === "very_high" ? "border-red-200" : "border-slate-200"}`}>
              {/* Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5" style={{ color: cfg.color }} />
                    <div>
                      <div className="font-bold text-slate-800">{h.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{h.ward} · {h.radius_meters}m radius</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge level={h.risk_level} />
                    <ConfidenceBadge confidence={h.confidence} size="sm" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <div className="font-bold text-slate-800">{h.report_count}</div>
                    <div className="text-xs text-slate-500">Total</div>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-2">
                    <div className="font-bold text-green-700">{h.verified_report_count}</div>
                    <div className="text-xs text-slate-500">Verified</div>
                  </div>
                  <div className="text-center bg-slate-50 rounded-lg p-2">
                    <div className="font-bold text-slate-800">{h.group_presence_count || 0}</div>
                    <div className="text-xs text-slate-500">Group reports</div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600 border border-slate-200">
                  <span className="font-medium">Why this risk level?</span> {h.explanation}
                </div>

                {h.time_pattern && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" /> {h.time_pattern}
                  </div>
                )}

                {h.nearby_factors?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {h.nearby_factors.map((f, j) => (
                      <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions recorded */}
              {hotspotActions.length > 0 && (
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Actions Recorded</div>
                  <div className="space-y-1.5">
                    {hotspotActions.slice(0, 3).map((a, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${a.status === "completed" ? "bg-green-400" : a.status === "in_progress" ? "bg-blue-400" : "bg-amber-400"}`} />
                        <span className="text-slate-600 font-medium">{a.action_type?.replace(/_/g, " ")}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-400">{a.authority_name?.split("—")[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add action */}
              <div className="px-5 py-3">
                {addingAction === h.id ? (
                  <div className="space-y-2">
                    <select
                      value={actionForm.action_type}
                      onChange={e => setActionForm(f => ({ ...f, action_type: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                    >
                      <option value="">Select action type...</option>
                      {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                    <textarea
                      value={actionForm.note}
                      onChange={e => setActionForm(f => ({ ...f, note: e.target.value }))}
                      placeholder="Add notes about this action..."
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleAddAction(h)} className="flex-1 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium">Record Action</button>
                      <button onClick={() => setAddingAction(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingAction(h.id)}
                    className="flex items-center gap-2 text-sm text-blue-700 font-medium hover:text-blue-900"
                  >
                    <Plus className="w-4 h-4" /> Record Action for this Hotspot
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}