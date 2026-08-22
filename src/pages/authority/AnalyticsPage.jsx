import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SEVERITY_LABELS, CATEGORY_LABELS } from "@/lib/riskEngine";
import {
  BarChart, Bar, AreaChart, Area, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

export default function AnalyticsPage() {
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

  // Reports by severity
  const severityData = [1, 2, 3, 4, 5].map(s => ({
    name: `L${s}`,
    fullName: SEVERITY_LABELS[s]?.short,
    count: reports.filter(r => r.severity_level === s).length,
    color: SEVERITY_LABELS[s]?.color,
  }));

  // Reports by category
  const categoryData = Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
    name: v.split(" ").slice(0, 2).join(" "),
    count: reports.filter(r => r.category === k).length,
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

  // Time-of-day distribution
  const todData = [
    { name: "Morning\n5–11AM", value: reports.filter(r => r.context_tags?.includes("morning")).length, color: "#FBBF24" },
    { name: "Afternoon\n11–5PM", value: reports.filter(r => r.context_tags?.includes("afternoon")).length, color: "#F97316" },
    { name: "Evening\n5–9PM", value: reports.filter(r => r.context_tags?.includes("evening")).length, color: "#EF4444" },
    { name: "Night\n9PM–5AM", value: reports.filter(r => r.context_tags?.includes("night")).length, color: "#7C3AED" },
  ];

  // Context tag breakdown
  const contextTagData = [
    { subject: "Near Waste", value: reports.filter(r => r.context_tags?.includes("near_waste")).length },
    { subject: "Near School", value: reports.filter(r => r.context_tags?.includes("near_school")).length },
    { subject: "Near Road", value: reports.filter(r => r.context_tags?.includes("near_road")).length },
    { subject: "Near Park", value: reports.filter(r => r.context_tags?.includes("near_park")).length },
    { subject: "Group Present", value: reports.filter(r => r.context_tags?.includes("group_presence")).length },
  ];

  // Rolling 45-day timeline
  const timelineData = [];
  for (let i = 14; i >= 0; i--) {
    const from = new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000);
    const to = new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000);
    const bucket = reports.filter(r => {
      const ts = new Date(r.incident_timestamp || r.created_date);
      return ts >= from && ts < to;
    });
    timelineData.push({
      label: `${from.getDate()}/${from.getMonth() + 1}`,
      total: bucket.length,
      verified: bucket.filter(r => r.verification_status === "verified").length,
      bites: bucket.filter(r => r.severity_level === 5).length,
    });
  }

  // Ward breakdown
  const wardData = ["Sector 62 Noida", "Sector 18 Atta Market", "Sector 37 Noida", "Sector 50 Noida", "Sector 93 Noida", "Sector 12 Noida"].map(w => ({
    name: w.split(" ").slice(0, 2).join(" "),
    total: reports.filter(r => r.ward === w).length,
    verified: reports.filter(r => r.ward === w && r.verification_status === "verified").length,
  })).sort((a, b) => b.total - a.total);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
          <div className="font-medium text-slate-800 mb-1">{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Noida Pilot · {reports.length} total reports</p>
      </div>

      {/* Reports over time */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="font-semibold text-slate-800 mb-4">Reports Over Time (45 days)</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a6e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1e3a6e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="verifiedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" stroke="#1e3a6e" strokeWidth={2} fill="url(#totalGrad)" name="Total" />
            <Area type="monotone" dataKey="verified" stroke="#16A34A" strokeWidth={2} fill="url(#verifiedGrad)" name="Verified" />
            <Area type="monotone" dataKey="bites" stroke="#DC2626" strokeWidth={1.5} fill="none" name="Bites" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#1e3a6e]" /> Total reports</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-600" /> Verified</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /> Bite/Contact</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="font-semibold text-slate-800 mb-4">Reports by Severity</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={severityData} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Reports">
                {severityData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time of day */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="font-semibold text-slate-800 mb-4">Time-of-Day Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={todData} barSize={40}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Reports">
                {todData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ward breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="font-semibold text-slate-800 mb-4">Reports by Ward</div>
          <div className="space-y-2.5">
            {wardData.map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-28 text-xs text-slate-600 truncate">{w.name}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-4 relative overflow-hidden">
                  <div className="h-full bg-blue-900 rounded-full" style={{ width: `${wardData[0].total ? w.total / wardData[0].total * 100 : 0}%` }} />
                  <div className="h-full bg-green-500 rounded-full absolute top-0 left-0" style={{ width: `${wardData[0].total ? w.verified / wardData[0].total * 100 : 0}%`, opacity: 0.4 }} />
                </div>
                <div className="w-12 text-xs text-slate-600 text-right">{w.total} total</div>
              </div>
            ))}
          </div>
        </div>

        {/* Context factors */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="font-semibold text-slate-800 mb-4">Contextual Factors</div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={contextTagData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
              <Radar name="Reports" dataKey="value" stroke="#1e3a6e" fill="#1e3a6e" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}