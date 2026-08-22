import { useState, useEffect } from "react";
import { reportsService, hotspotsService, authorityActionsService, wardsService } from "@/api/services";
import { Link } from "react-router-dom";
import { FileText, CheckSquare, AlertTriangle, Flame, MapPin, Zap } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { RISK_LEVELS, SEVERITY_LABELS, CATEGORY_LABELS } from "@/lib/riskEngine";
import RiskBadge from "@/components/RiskBadge";

export default function AuthorityOverview() {
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [actions, setActions] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsService.filter({ is_demo: true }),
      hotspotsService.filter({ is_demo: true }),
      authorityActionsService.filter({ is_demo: true }),
      wardsService.filter({ is_demo: true }),
    ]).then(([r, h, a, w]) => {
      setReports(r);
      setHotspots(h);
      setActions(a);
      setWards(w);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" /></div>;
  }

  const totalReports = reports.length;
  const verifiedReports = reports.filter(r => r.verification_status === "verified").length;
  const underReview = reports.filter(r => r.status === "under_review").length;
  const biteReports = reports.filter(r => r.severity_level === 5).length;
  const activeHotspots = hotspots.filter(h => h.is_active).length;
  const highRiskAreas = hotspots.filter(h => h.risk_level === "high" || h.risk_level === "very_high").length;
  const pendingActions = actions.filter(a => a.status === "pending" || a.status === "in_progress").length;

  // Reports over time (last 30 days grouped by 3-day buckets)
  const timelineData = [];
  for (let i = 9; i >= 0; i--) {
    const from = new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000);
    const to = new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000);
    const count = reports.filter(r => {
      const ts = new Date(r.incident_timestamp || r.created_date);
      return ts >= from && ts < to;
    }).length;
    timelineData.push({ label: `D-${i * 3}`, count });
  }

  // Severity distribution
  const severityData = [1, 2, 3, 4, 5].map(s => ({
    name: SEVERITY_LABELS[s]?.short,
    value: reports.filter(r => r.severity_level === s).length,
    color: SEVERITY_LABELS[s]?.color,
  }));

  // Category distribution
  const categoryData = Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
    name: v.split(" ").slice(0, 2).join(" "),
    value: reports.filter(r => r.category === k).length,
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const METRIC_CARDS = [
    { label: "Total Reports", value: totalReports, icon: FileText, color: "text-blue-700", bg: "bg-blue-50", trend: "+16% vs last 7d" },
    { label: "Verified Reports", value: verifiedReports, icon: CheckSquare, color: "text-green-700", bg: "bg-green-50", trend: `${Math.round(verifiedReports/totalReports*100)}% verified rate` },
    { label: "Under Review", value: underReview, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", trend: "Needs moderation" },
    { label: "Bite / Contact", value: biteReports, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", trend: "-12% vs last 7d" },
    { label: "Active Hotspots", value: activeHotspots, icon: Flame, color: "text-orange-600", bg: "bg-orange-50", trend: `${highRiskAreas} high-risk` },
    { label: "High-Risk Areas", value: highRiskAreas, icon: MapPin, color: "text-red-700", bg: "bg-red-50", trend: "Immediate attention" },
    { label: "Actions Pending", value: pendingActions, icon: Zap, color: "text-purple-600", bg: "bg-purple-50", trend: `${actions.filter(a=>a.status==='completed').length} completed` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Noida Pilot · Sector 62 Zone · Last 30 days</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_CARDS.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${m.color} mb-0.5`}>{m.value}</div>
              <div className="text-sm font-medium text-slate-700">{m.label}</div>
              <div className="text-xs text-slate-400 mt-1">{m.trend}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports over time */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-slate-800">Reports Over Time</div>
            <span className="text-xs text-slate-400">Last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a6e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1e3a6e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Area type="monotone" dataKey="count" stroke="#1e3a6e" strokeWidth={2} fill="url(#grad1)" name="Reports" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="font-semibold text-slate-800 mb-4">Reports by Severity</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={severityData} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Count">
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top risk areas */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-slate-800">Top Risk Areas</div>
          <Link to="/authority/wards" className="text-sm text-blue-700 font-medium hover:underline">View all wards →</Link>
        </div>
        <div className="space-y-3">
          {hotspots.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)).slice(0, 5).map((h, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-6 text-center text-sm font-bold text-slate-400">#{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{h.name}</div>
                <div className="text-xs text-slate-500">{h.verified_report_count} verified reports · {h.ward}</div>
              </div>
              <RiskBadge level={h.risk_level} size="sm" />
              <div className="w-24">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{h.risk_score}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${h.risk_score}%`, backgroundColor: RISK_LEVELS[h.risk_level]?.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-slate-800">Recent Authority Actions</div>
          <Link to="/authority/actions" className="text-sm text-blue-700 font-medium hover:underline">View all →</Link>
        </div>
        <div className="space-y-3">
          {actions.slice(0, 4).map((action, i) => {
            const statusColors = { pending: "text-amber-600 bg-amber-50", in_progress: "text-blue-600 bg-blue-50", completed: "text-green-600 bg-green-50" };
            return (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700">{action.note?.slice(0, 80)}...</div>
                  <div className="text-xs text-slate-400 mt-0.5">{action.authority_name} · {action.location_label}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[action.status] || "text-slate-500 bg-slate-50"}`}>
                  {action.status?.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}