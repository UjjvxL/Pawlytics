import { useState, useEffect } from "react";
import { authorityActionsService } from "@/api/services";
import { Plus, CheckCircle, Clock, XCircle, Zap } from "lucide-react";

const ACTION_TYPE_LABELS = {
  field_inspection_scheduled: "Field Inspection Scheduled",
  abc_team_notified: "ABC Team Notified",
  waste_issue_reported: "Waste Issue Reported",
  area_inspection_completed: "Area Inspection Completed",
  public_warning_issued: "Public Warning Issued",
  feeding_zone_review: "Feeding Zone Review",
  sterilization_drive_scheduled: "Sterilization Drive Scheduled",
  vaccination_drive_scheduled: "Vaccination Drive Scheduled",
  other: "Other",
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200", icon: Zap },
  completed: { label: "Completed", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-slate-500 bg-slate-50 border-slate-200", icon: XCircle },
};

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ action_type: "", note: "", location_label: "", ward_id: "" });
  const [submitting, setSubmitting] = useState(false);

  const WARD_OPTIONS = ["Sector 62 Noida", "Sector 18 Atta Market", "Sector 37 Noida", "Sector 50 Noida", "Sector 93 Noida", "Sector 12 Noida"];

  useEffect(() => {
    authorityActionsService.filter({ is_demo: true })
      .then(a => {
        setActions(a.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    if (!form.action_type || !form.location_label) return;
    setSubmitting(true);
    const created = await authorityActionsService.create({
      ...form,
      authority_name: "Authority Demo User",
      status: "pending",
      is_demo: true,
    });
    setActions(prev => [created, ...prev]);
    setForm({ action_type: "", note: "", location_label: "", ward_id: "" });
    setShowForm(false);
    setSubmitting(false);
  };

  const updateStatus = async (id, status) => {
    await authorityActionsService.update(id, {
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    });
    setActions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const filtered = actions.filter(a => filter === "all" || a.status === filter);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">Authority Actions</h1>
          <p className="text-slate-500 text-sm mt-1">Auditable intervention trail · {actions.length} recorded actions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Record Action
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl border-2 border-blue-200 p-5 animate-fade-in">
          <div className="font-semibold text-slate-800 mb-4">Record New Action</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1.5 block">Action Type</label>
              <select
                value={form.action_type}
                onChange={e => setForm(f => ({ ...f, action_type: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              >
                <option value="">Select...</option>
                {Object.entries(ACTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1.5 block">Location / Ward</label>
              <select
                value={form.location_label}
                onChange={e => setForm(f => ({ ...f, location_label: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              >
                <option value="">Select ward...</option>
                {WARD_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium text-slate-500 uppercase mb-1.5 block">Notes</label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Describe the action taken or planned..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={submitting || !form.action_type || !form.location_label}
              className="flex-1 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-medium disabled:opacity-60">
              {submitting ? "Saving..." : "Record Action"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[["all", "All"], ["pending", "Pending"], ["in_progress", "In Progress"], ["completed", "Completed"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Actions list */}
      <div className="space-y-3">
        {filtered.map((action, i) => {
          const statusCfg = STATUS_CONFIG[action.status] || STATUS_CONFIG.pending;
          const StatusIcon = statusCfg.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{ACTION_TYPE_LABELS[action.action_type] || action.action_type}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{action.authority_name} · {action.location_label}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border flex items-center gap-1 flex-shrink-0 ${statusCfg.color}`}>
                  <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                </span>
              </div>
              {action.note && <p className="text-sm text-slate-600 mb-3">{action.note}</p>}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <span>📅 {new Date(action.created_date).toLocaleDateString("en-IN")}</span>
                {action.completed_at && <span>✓ Completed {new Date(action.completed_at).toLocaleDateString("en-IN")}</span>}
              </div>
              {action.status !== "completed" && action.status !== "cancelled" && (
                <div className="flex gap-2">
                  {action.status === "pending" && (
                    <button onClick={() => updateStatus(action.id, "in_progress")} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                      Mark In Progress
                    </button>
                  )}
                  <button onClick={() => updateStatus(action.id, "completed")} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200">
                    Mark Completed
                  </button>
                  <button onClick={() => updateStatus(action.id, "cancelled")} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-xs font-medium border border-slate-200">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-slate-500 font-medium">No {filter !== "all" ? filter : ""} actions</div>
          </div>
        )}
      </div>
    </div>
  );
}