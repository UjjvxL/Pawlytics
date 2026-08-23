import { useState, useEffect } from "react";
import { reportsService, hotspotsService, authorityActionsService, wardsService } from "@/api/services";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CheckSquare, AlertTriangle, Flame, MapPin, Zap, TrendingUp, ShieldAlert, ArrowRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { RISK_LEVELS, SEVERITY_LABELS, CATEGORY_LABELS } from "@/lib/riskEngine";
import RiskBadge from "@/components/RiskBadge";
import { DoggoWalking } from "@/components/DoggoIllustrations";

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
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <DoggoWalking size={80} />
        <div className="text-xs font-mono text-zinc-400">Loading intelligence dashboard...</div>
      </div>
    );
  }

  const totalReports = reports.length;
  const verifiedReports = reports.filter(r => r.verification_status === "verified").length;
  const underReview = reports.filter(r => r.status === "under_review").length;
  const biteReports = reports.filter(r => r.severity_level === 5).length;
  const activeHotspots = hotspots.filter(h => h.is_active).length;
  const highRiskAreas = hotspots.filter(h => h.risk_level === "high" || h.risk_level === "very_high").length;
  const pendingActions = actions.filter(a => a.status === "pending" || a.status === "in_progress").length;

  // Timeline data (last 30 days)
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

  // Severity data
  const severityData = [1, 2, 3, 4, 5].map(s => ({
    name: SEVERITY_LABELS[s]?.short,
    value: reports.filter(r => r.severity_level === s).length,
    color: SEVERITY_LABELS[s]?.color,
  }));

  const METRIC_CARDS = [
    { label: "Total Reports", value: totalReports, icon: FileText, color: "text-[#1a2744]", bg: "bg-blue-50/80", trend: "+16% 30d" },
    { label: "Verified Reports", value: verifiedReports, icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50/80", trend: `${Math.round(verifiedReports / (totalReports || 1) * 100)}% rate` },
    { label: "Under Review", value: underReview, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50/80", trend: "Needs moderation" },
    { label: "Bite / Contact", value: biteReports, icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50/80", trend: "High priority" },
    { label: "Active Hotspots", value: activeHotspots, icon: Flame, color: "text-orange-600", bg: "bg-orange-50/80", trend: `${highRiskAreas} high-risk` },
    { label: "Actions Pending", value: pendingActions, icon: Zap, color: "text-purple-600", bg: "bg-purple-50/80", trend: `${actions.filter(a => a.status === 'completed').length} done` },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Intelligence Command</h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">Noida Pilot Zone · Sector 62 Sector Telemetry · 30-Day Window</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/authority/map"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2744] text-white text-xs font-semibold rounded-xl shadow-md hover:bg-[#25375e] transition-colors btn-press"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Launch Live Risk Map</span>
          </Link>
        </div>
      </div>

      {/* Bento Grid — Metrics Tier (6 items) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {METRIC_CARDS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold font-mono tracking-tight ${m.color} mb-0.5 tabular-nums`}>{m.value}</div>
              <div className="text-xs font-semibold text-zinc-800 truncate">{m.label}</div>
              <div className="text-[10px] text-zinc-400 font-mono mt-1">{m.trend}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Bento Tier 2 — Charts (2 Columns: 60/40) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Incident Telemetry Trend</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">3-day aggregated report velocity</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" /> Stable
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e4e4e7", fontSize: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} fill="url(#grad1)" name="Reports" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-zinc-900 text-sm">Severity Spectrum</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">Level 1 (Nuisance) → Level 5 (Severe Bite)</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={severityData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e4e4e7", fontSize: "12px" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Count">
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bento Tier 3 — Wards & Actions (2 Columns: 50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risk Sectors */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-zinc-900 text-sm">Critical Risk Sectors</h3>
            <Link to="/authority/wards" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {hotspots.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)).slice(0, 5).map((h, i) => (
              <div key={i} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                <div className="w-6 text-center text-xs font-mono font-bold text-zinc-400">#{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 truncate">{h.name}</div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">{h.verified_report_count} verified · {h.ward}</div>
                </div>
                <RiskBadge level={h.risk_level} size="sm" />
                <div className="w-20 hidden sm:block">
                  <div className="text-right text-xs font-mono font-bold text-zinc-700 mb-1">{h.risk_score}/100</div>
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
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

        {/* Recent Actions Feed */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-zinc-900 text-sm">Field Intervention Log</h3>
            <Link to="/authority/actions" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              View log <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {actions.slice(0, 4).map((action, i) => {
              const statusColors = {
                pending: "text-amber-700 bg-amber-50 border-amber-200",
                in_progress: "text-blue-700 bg-blue-50 border-blue-200",
                completed: "text-emerald-700 bg-emerald-50 border-emerald-200"
              };
              return (
                <div key={i} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-800 leading-relaxed">{action.note?.slice(0, 85)}...</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-1">{action.authority_name} · {action.location_label}</div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold border flex-shrink-0 ${statusColors[action.status] || "text-zinc-500 bg-zinc-50"}`}>
                    {action.status?.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}