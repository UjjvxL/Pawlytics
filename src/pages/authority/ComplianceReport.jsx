import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RISK_LEVELS, SEVERITY_LABELS } from "@/lib/riskEngine";
import RiskBadge from "@/components/RiskBadge";
import { ClipboardList } from "lucide-react";

export default function ComplianceReport() {
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const [config, setConfig] = useState({
    municipality: "New Okhla Industrial Development Authority (NOIDA)",
    ward: "All Sectors — Sector 62 Zone Pilot",
    period: "30d",
    includeActions: true,
    includeMethodology: true,
  });

  useEffect(() => {
    Promise.all([
      base44.entities.Report.filter({ is_demo: true }),
      base44.entities.Hotspot.filter({ is_demo: true }),
      base44.entities.AuthorityAction.filter({ is_demo: true }),
    ]).then(([r, h, a]) => {
      setReports(r);
      setHotspots(h);
      setActions(a);
      setLoading(false);
    });
  }, []);

  const verifiedReports = reports.filter(r => r.verification_status === "verified");
  const biteReports = reports.filter(r => r.severity_level === 5);
  const pendingActions = actions.filter(a => a.status === "pending");
  const completedActions = actions.filter(a => a.status === "completed");
  const activeHotspots = hotspots.filter(h => h.is_active);
  const highRiskHotspots = hotspots.filter(h => h.risk_level === "high" || h.risk_level === "very_high");

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setReportGenerated(true);
    }, 1500);
  };

  const PERIOD_LABELS = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">Compliance Report Generator</h1>
        <p className="text-slate-500 text-sm mt-1">Generate municipal sector-level conflict intelligence reports</p>
      </div>

      {/* Config panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-base font-semibold text-slate-800 mb-4">Report Configuration</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Municipality</label>
            <select
              value={config.municipality}
              onChange={e => setConfig(c => ({ ...c, municipality: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option>New Okhla Industrial Development Authority (NOIDA)</option>
              <option>Gautam Buddh Nagar Nagar Nigam</option>
              <option>Ghaziabad Municipal Corporation</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Ward / Zone</label>
            <select
              value={config.ward}
              onChange={e => setConfig(c => ({ ...c, ward: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            >
              <option>All Sectors — Sector 62 Zone Pilot</option>
              <option>Sector 62 Noida</option>
              <option>Sector 18 Atta Market</option>
              <option>Sector 50 Noida</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Reporting Period</label>
            <div className="flex gap-2">
              {[["7d", "7 Days"], ["30d", "30 Days"], ["90d", "90 Days"]].map(([v, l]) => (
                <button key={v} onClick={() => setConfig(c => ({ ...c, period: v }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${config.period === v ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600"}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {generating ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating Report...</>
          ) : (
            <><ClipboardList className="w-5 h-5" /> Generate Compliance Report</>
          )}
        </button>
      </div>

      {/* Report output */}
      {reportGenerated && (
        <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm overflow-hidden animate-fade-in">
          {/* Report header */}
          <div className="bg-[#1a2744] px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-blue-300 uppercase tracking-wider mb-1">Conflict Intelligence Report</div>
                <div className="text-xl font-bold font-display">Human–Street Dog Conflict Assessment</div>
                <div className="text-blue-200 text-sm mt-1">{config.municipality}</div>
                <div className="text-blue-300 text-sm">{config.ward} · {PERIOD_LABELS[config.period]}</div>
              </div>
              <div className="text-right">
                <div className="text-blue-300 text-xs">Generated</div>
                <div className="text-white text-sm font-mono">{new Date().toLocaleDateString("en-IN")}</div>
                <div className="text-blue-300 text-xs mt-1">{new Date().toLocaleTimeString("en-IN")}</div>
                <div className="demo-badge mt-2">DEMO / PILOT DATA</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Legal disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <strong>Important:</strong> Risk estimates are decision-support indicators based on available verified citizen reports and should not be interpreted as predictions of individual animal behavior. This report is generated from demo/pilot data for SIH 2026 demonstration purposes only.
            </div>

            {/* Executive Summary */}
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">1</span>
                Executive Summary
              </h2>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                During the reporting period, the Sector 62 Zone pilot area (Noida) recorded <strong>{reports.length} total reports</strong> of human–street dog conflict interactions,
                of which <strong>{verifiedReports.length} were verified</strong> by moderators. The data reveals concentrated conflict clusters in
                {activeHotspots.length > 0 && ` ${activeHotspots.length} active hotspot areas`}, with the highest-density cluster
                at Sector 62 Noida (IT corridor waste zone). <strong>{biteReports.length} contact/bite incidents</strong> were verified during this period,
                all requiring immediate public health attention.
              </div>
            </section>

            {/* Key Metrics */}
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">2</span>
                Report Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Reports", value: reports.length, color: "text-blue-700", bg: "bg-blue-50" },
                  { label: "Verified Reports", value: verifiedReports.length, color: "text-green-700", bg: "bg-green-50" },
                  { label: "Contact / Bite", value: biteReports.length, color: "text-red-700", bg: "bg-red-50" },
                  { label: "Verification Rate", value: `${Math.round(verifiedReports.length / reports.length * 100)}%`, color: "text-slate-700", bg: "bg-slate-50" },
                ].map((m, i) => (
                  <div key={i} className={`rounded-xl p-3 ${m.bg}`}>
                    <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Severity Distribution */}
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">3</span>
                Severity Distribution
              </h2>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(s => {
                  const count = reports.filter(r => r.severity_level === s).length;
                  const pct = reports.length > 0 ? Math.round(count / reports.length * 100) : 0;
                  const sev = SEVERITY_LABELS[s];
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-24 text-xs font-mono font-medium" style={{ color: sev?.color }}>{sev?.label}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-5 relative overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: sev?.color }} />
                        <span className="absolute right-2 top-0 bottom-0 flex items-center text-xs font-medium text-slate-600">{count}</span>
                      </div>
                      <div className="w-8 text-xs text-slate-500 text-right">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Hotspot Summary */}
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">4</span>
                Hotspot Risk Summary
              </h2>
              <div className="space-y-3">
                {hotspots.slice(0, 4).map((h, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl">
                    <div className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: RISK_LEVELS[h.risk_level]?.color }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-800 text-sm">{h.name}</div>
                        <RiskBadge level={h.risk_level} size="sm" />
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{h.verified_report_count} verified reports · {h.confidence} confidence · Score: {h.risk_score}/100</div>
                      <div className="text-xs text-slate-400 mt-1 italic">{h.time_pattern}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Authority Actions */}
            {config.includeActions && (
              <section>
                <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">5</span>
                  Authority Actions
                </h2>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center bg-blue-50 rounded-xl p-3">
                    <div className="font-bold text-blue-700 text-xl">{actions.length}</div>
                    <div className="text-xs text-slate-500">Total Recorded</div>
                  </div>
                  <div className="text-center bg-green-50 rounded-xl p-3">
                    <div className="font-bold text-green-700 text-xl">{completedActions.length}</div>
                    <div className="text-xs text-slate-500">Completed</div>
                  </div>
                  <div className="text-center bg-amber-50 rounded-xl p-3">
                    <div className="font-bold text-amber-700 text-xl">{pendingActions.length}</div>
                    <div className="text-xs text-slate-500">Pending</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm border-b border-slate-100 pb-2 last:border-0">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.status === "completed" ? "bg-green-400" : "bg-amber-400"}`} />
                      <div className="flex-1">
                        <span className="font-medium text-slate-700 capitalize">{a.action_type?.replace(/_/g, " ")}</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-500">{a.location_label}</span>
                        {a.note && <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{a.note}</div>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{a.status?.replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Data Confidence */}
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">6</span>
                Data Confidence & Limitations
              </h2>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-2">
                <div>• Risk scores are composite indicators, not predictions of individual animal behavior or future incidents.</div>
                <div>• Areas with fewer than 3 verified reports are labeled "Unknown risk" — absence of data does not imply safety.</div>
                <div>• Report data depends on citizen participation; underreporting may occur in areas with low digital access.</div>
                <div>• All reports undergo human moderation before contributing to risk scores.</div>
                <div>• CV dog detection is prototype-grade and serves as a supporting signal for moderators, not a primary evidence source.</div>
              </div>
            </section>

            {config.includeMethodology && (
              <section>
                <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">7</span>
                  Methodology
                </h2>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-2">
                  <div><strong>Risk Score:</strong> Composite of verified report count, severity distribution, group presence, contextual proximity (waste/school/road), and temporal decay (30-day rolling window). Normalized 0–100.</div>
                  <div><strong>Hotspot Detection:</strong> Simplified spatial clustering on verified report coordinates (DBSCAN-equivalent). Minimum 3 verified reports within 300m radius required.</div>
                  <div><strong>Confidence Levels:</strong> 0–2 reports = Insufficient; 3–9 = Low; 10–29 = Moderate; 30+ = High.</div>
                  <div><strong>Pipeline:</strong> Report → CV Detection → Context Tags → Moderation → Verified Event → Risk Engine → Hotspot Layer.</div>
                </div>
              </section>
            )}

            {/* Footer */}
            <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
              Generated by Pawlytics — Human–Street Dog Conflict Intelligence Platform (SIH 2026 MVP) ·
              {new Date().toLocaleString("en-IN")} · Demo / Pilot Data — Not real government records
            </div>
          </div>
        </div>
      )}
    </div>
  );
}