import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportsService, hotspotsService, alertsService, wardsService } from "@/api/services";
import { MapPin, AlertTriangle, Navigation, Map, Plus, Bell, HelpCircle, Shield, HeartPulse } from "lucide-react";
import ArvEmergencyModal from "@/components/ArvEmergencyModal";
import { RISK_LEVELS, CONFIDENCE_LEVELS, calculateRiskScore } from "@/lib/riskEngine";
import RiskBadge, { ConfidenceBadge } from "@/components/RiskBadge";
import DemoBanner from "@/components/DemoBanner";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const SAFETY_TIPS = [
  "Maintain calm posture — do not run if approached by a dog.",
  "Avoid eye contact with a dog displaying tense body posture.",
  "If followed, stop, fold your arms, and avoid sudden movements.",
  "Carry an umbrella or bag that can serve as a barrier.",
  "Report incidents promptly — your data helps protect others.",
  "If bitten, wash wound immediately and seek ARV treatment.",
];

export default function CitizenHome() {
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArvModal, setShowArvModal] = useState(false);

  useEffect(() => {
    Promise.all([
      reportsService.filter({ is_demo: true }),
      hotspotsService.filter({ is_demo: true, is_active: true }),
      alertsService.filter({ is_demo: true, is_active: true }),
      wardsService.filter({ is_demo: true }),
    ]).then(([r, h, a, w]) => {
      setReports(r);
      setHotspots(h.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)));
      setAlerts(a.slice(0, 3));
      setWards(w.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0)));
      setLoading(false);
    });
  }, []);

  const topHotspot = hotspots[0];
  const currentLocality = "Sector 62 Noida";
  const localReports = reports.filter(r => r.ward === currentLocality);
  const riskResult = calculateRiskScore(localReports);
  const riskConfig = RISK_LEVELS[riskResult.level] || RISK_LEVELS.unknown;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner />

      {/* Header */}
      <header className="bg-[#1a2744] px-4 pt-8 pb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Logo onDark size={30} />
            <div className="text-blue-300 text-xs mt-1">Conflict Intelligence</div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="rounded-full bg-white/10 hover:bg-white/20 text-white" />
            <button className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                  {alerts.length}
                </span>
              )}
            </button>
            <Link to="/authority" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <Shield className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-blue-200 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{currentLocality}</span>
          <span className="text-blue-400">· Noida</span>
        </div>

        {/* Primary risk card */}
        <div className={`rounded-2xl p-4 border ${riskConfig.border}`} style={{ backgroundColor: riskConfig.color + "20" }}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-xs text-blue-200 uppercase tracking-wider mb-1">Know Before You Go</div>
              <div className="text-2xl font-bold text-white font-display">{currentLocality}</div>
            </div>
            <RiskBadge level={riskResult.level} size="lg" />
          </div>
          <div className="text-sm text-blue-100 mb-3">
            {riskResult.level === "unknown"
              ? "Insufficient data — risk level cannot be reliably estimated."
              : `${riskResult.verifiedCount} verified report${riskResult.verifiedCount !== 1 ? 's' : ''} in the last 30 days`}
          </div>
          <div className="flex items-center justify-between">
            <ConfidenceBadge confidence={riskResult.confidence} />
            {topHotspot && (
              <div className="text-xs text-blue-200">
                Nearest hotspot: {topHotspot.name?.split("—")[0]?.trim()}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-5 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/report" className="bg-blue-900 text-white rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">Report Incident</div>
                <div className="text-blue-200 text-xs">Takes ~2 minutes</div>
              </div>
            </Link>
            <Link to="/routes" className="bg-white text-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-slate-200 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="font-semibold text-sm">Check Route</div>
                <div className="text-slate-400 text-xs">Conflict exposure</div>
              </div>
            </Link>
            <button
              onClick={() => setShowArvModal(true)}
              className="bg-red-50 text-red-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-red-200 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-semibold text-sm">ARV Centers</div>
                <div className="text-red-600 text-xs">First-Aid & Clinics</div>
              </div>
            </button>
            <Link to="/map?view=hotspots" className="bg-white text-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-slate-200 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="font-semibold text-sm">Hotspots</div>
                <div className="text-slate-400 text-xs">{hotspots.length} active</div>
              </div>
            </Link>
          </div>
        </section>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Active Alerts</h2>
            <div className="space-y-2">
              {alerts.slice(0, 2).map((alert, i) => (
                <div key={i} className={`rounded-xl p-3 border flex items-start gap-3 ${
                  alert.severity === "critical" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                }`}>
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                  <div>
                    <div className={`text-sm font-semibold ${alert.severity === "critical" ? "text-red-800" : "text-amber-800"}`}>{alert.title}</div>
                    <div className={`text-xs mt-0.5 ${alert.severity === "critical" ? "text-red-600" : "text-amber-600"}`}>{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Risk Areas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nearby Risk Areas</h2>
            <Link to="/map" className="text-xs text-blue-700 font-medium">View map →</Link>
          </div>
          <div className="space-y-2">
            {wards.slice(0, 3).map((ward, i) => {
              const wardReports = reports.filter(r => r.ward === ward.name);
              const risk = calculateRiskScore(wardReports);
              const cfg = RISK_LEVELS[risk.level];
              return (
                <div key={i} className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{ward.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {wardReports.length} report{wardReports.length !== 1 ? 's' : ''} · {CONFIDENCE_LEVELS[risk.confidence]?.label}
                    </div>
                  </div>
                  <RiskBadge level={risk.level} size="sm" showIcon={false} />
                </div>
              );
            })}
            <div className="bg-slate-100 rounded-xl p-3 text-center text-xs text-slate-500 border border-dashed border-slate-300">
              <HelpCircle className="w-4 h-4 mx-auto mb-1 text-slate-400" />
              Areas without reports show Unknown Risk — absence of data ≠ safe
            </div>
          </div>
        </section>

        {/* Safety Guidance */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Safety Guidance</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-blue-700" />
              <span className="font-semibold text-slate-800 text-sm">General Safety Reminders</span>
            </div>
            <div className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3 border border-amber-200">
              This is general public safety guidance, not medical advice. If bitten, seek medical attention immediately.
            </div>
            <ul className="space-y-2">
              {SAFETY_TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="text-center text-xs text-slate-400 pb-4">
          Pawlytics maps conflict patterns — not individual animals.
          <br />Risk scores are decision-support indicators, not predictions.
        </div>
      </div>

      <ArvEmergencyModal isOpen={showArvModal} onClose={() => setShowArvModal(false)} />
    </div>
  );
}