import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/riskEngine";
import { Search, Filter, FileText } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    base44.entities.Report.filter({ is_demo: true })
      .then(r => {
        setReports(r.sort((a, b) => new Date(b.incident_timestamp) - new Date(a.incident_timestamp)));
        setLoading(false);
      });
  }, []);

  const filtered = reports.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (r.location_label || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.ward || "").toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">All Reports</h1>
        <p className="text-slate-500 text-sm mt-1">{reports.length} total reports in pilot area</p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by location, description..."
            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30"
        >
          <option value="all">All Status</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="duplicate">Duplicate</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / Severity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date/Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">CV</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 40).map((r, i) => {
                const sev = SEVERITY_LABELS[r.severity_level];
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{CATEGORY_LABELS[r.category]}</div>
                      <div className="text-xs font-medium mt-0.5" style={{ color: sev?.color }}>{sev?.label}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.location_label}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.incident_timestamp).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      {r.cv_status !== "no_image" ? (
                        <div className="text-xs">
                          <div className="text-slate-700 font-medium">{r.cv_dog_count} dog{r.cv_dog_count !== 1 ? 's' : ''}</div>
                          <div className={`mt-0.5 ${r.cv_status === "low_confidence" ? "text-amber-500" : "text-slate-400"}`}>
                            {Math.round(r.cv_confidence * 100)}% conf
                          </div>
                        </div>
                      ) : <span className="text-xs text-slate-300">No image</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        r.status === "verified" ? "bg-green-100 text-green-700" :
                        r.status === "rejected" ? "bg-red-100 text-red-700" :
                        r.status === "duplicate" ? "bg-slate-100 text-slate-500" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {r.status?.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <div className="text-slate-500">No reports match your filter</div>
          </div>
        )}
      </div>
    </div>
  );
}