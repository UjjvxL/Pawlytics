import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { reportsService, hotspotsService, alertsService, wardsService } from "@/api/services";
import { MapPin, AlertTriangle, Navigation, Plus, Bell, HelpCircle, Shield, HeartPulse, Mic, Sparkles, ChevronRight, ChevronDown } from "lucide-react";
import ArvEmergencyModal from "@/components/ArvEmergencyModal";
import LocationSelectorModal from "@/components/LocationSelectorModal";
import { useLocationState } from "@/lib/locationContext";
import { RISK_LEVELS, CONFIDENCE_LEVELS, calculateRiskScore } from "@/lib/riskEngine";
import RiskBadge, { ConfidenceBadge } from "@/components/RiskBadge";
import DemoBanner from "@/components/DemoBanner";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { DoggoSitting, PawPrint } from "@/components/DoggoIllustrations";

const SAFETY_TIPS = [
  "Maintain calm posture — do not run if approached by a dog.",
  "Avoid eye contact with a dog displaying tense body posture.",
  "If followed, stop, fold your arms, and avoid sudden movements.",
  "Carry an umbrella or bag that can serve as a barrier.",
  "Report incidents promptly — your data helps protect others.",
  "If bitten, wash wound immediately with soap and seek ARV treatment.",
];

export default function CitizenHome() {
  const { currentLocality, currentZone } = useLocationState();
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArvModal, setShowArvModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

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
  
  // Filter reports for current active locality
  const localReports = reports.filter(r => {
    if (!r.ward && !r.location_label) return false;
    const locLower = currentLocality.toLowerCase();
    const wardLower = (r.ward || "").toLowerCase();
    const labelLower = (r.location_label || "").toLowerCase();
    return wardLower.includes(locLower) || labelLower.includes(locLower) || locLower.includes(wardLower.split(" ")[0]);
  });

  const riskResult = calculateRiskScore(localReports);
  const riskConfig = RISK_LEVELS[riskResult.level] || RISK_LEVELS.unknown;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-zinc-50 space-y-4">
        <DoggoSitting size={100} className="animate-bounce" />
        <div className="text-sm font-medium text-zinc-500 font-mono">Fetching conflict intelligence...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      <DemoBanner />

      {/* Main Container — Constrained for clean mobile & PC rendering */}
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="bg-[#1a2744] px-5 pt-8 pb-6 text-white rounded-b-3xl shadow-xl relative overflow-hidden">
          {/* Subtle paw watermark in header background */}
          <div className="absolute right-3 bottom-2 opacity-5 pointer-events-none text-white">
            <PawPrint size={160} />
          </div>

          <div className="flex items-center justify-between mb-5 relative z-10">
            <div>
              <Logo onDark size={30} />
              <div className="text-emerald-400 text-[11px] font-mono mt-0.5 tracking-wider uppercase">Citizen Portal</div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle className="rounded-full bg-white/10 hover:bg-white/20 text-white p-2" />
              <button className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors btn-press">
                <Bell className="w-5 h-5 text-zinc-200" />
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>
              <Link to="/authority" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors btn-press" title="Authority Portal">
                <Shield className="w-5 h-5 text-emerald-400" />
              </Link>
            </div>
          </div>

          {/* Interactive Location Bar */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-2 text-zinc-300 text-xs mb-4 bg-white/10 hover:bg-white/20 active:scale-95 transition-all backdrop-blur-md w-fit px-3.5 py-1.5 rounded-full border border-white/15 cursor-pointer group shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-white">{currentLocality}</span>
            <span className="text-zinc-400">· {currentZone}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors ml-0.5" />
          </button>

          {/* Primary Risk Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`rounded-2xl p-5 border backdrop-blur-md relative overflow-hidden`}
            style={{
              backgroundColor: riskConfig.color + "18",
              borderColor: riskConfig.color + "40"
            }}
          >
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div>
                <div className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest mb-1">Local Risk Assessment</div>
                <div className="text-2xl font-bold text-white tracking-tight">{currentLocality}</div>
              </div>
              <RiskBadge level={riskResult.level} size="lg" />
            </div>

            <div className="text-xs text-zinc-200 mb-4 leading-relaxed relative z-10">
              {riskResult.level === "unknown"
                ? "Insufficient local telemetry — risk level cannot be reliably estimated."
                : `${riskResult.verifiedCount} verified report${riskResult.verifiedCount !== 1 ? 's' : ''} recorded in last 30 days`}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
              <ConfidenceBadge confidence={riskResult.confidence} />
              {topHotspot && (
                <div className="text-[11px] text-zinc-300 font-medium truncate max-w-[160px]">
                  Hotspot: {topHotspot.name?.split("—")[0]?.trim()}
                </div>
              )}
            </div>
          </motion.div>
        </header>

        {/* Content Body */}
        <div className="px-4 py-6 space-y-6">
          {/* Quick Actions */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/report" className="bg-[#1a2744] text-white rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-[#1a2744]/15 active:scale-95 transition-all group border border-[#1a2744]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Report Incident</div>
                  <div className="text-zinc-400 text-xs mt-0.5">Photo & Voice supported</div>
                </div>
              </Link>

              <Link to="/routes" className="bg-white text-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm border border-zinc-200/80 active:scale-95 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-zinc-900">Check Route</div>
                  <div className="text-zinc-400 text-xs mt-0.5">Safe navigation</div>
                </div>
              </Link>

              <button
                onClick={() => setShowArvModal(true)}
                className="bg-rose-50 text-rose-900 rounded-2xl p-4 flex flex-col justify-between border border-rose-200/80 active:scale-95 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-rose-950">ARV Centers</div>
                  <div className="text-rose-600 text-xs mt-0.5">Vaccine & Clinics</div>
                </div>
              </button>

              <Link to="/map?view=hotspots" className="bg-white text-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm border border-zinc-200/80 active:scale-95 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-zinc-900">Hotspot Map</div>
                  <div className="text-zinc-400 text-xs mt-0.5">{hotspots.length} active zones</div>
                </div>
              </Link>
            </div>

            {/* Multilingual Voice Assistant Banner */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/report"
                className="mt-3 bg-gradient-to-r from-[#1a2744] to-zinc-900 text-white rounded-2xl p-4 flex items-center justify-between border border-emerald-500/30 shadow-lg block relative overflow-hidden"
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Voice Assistant</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Hindi/Eng/Mar
                      </span>
                    </div>
                    <div className="text-xs text-zinc-300 mt-0.5">Speak your report via microphone</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400 relative z-10" />
              </Link>
            </motion.div>
          </section>

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-3">Active Alerts</h2>
              <div className="space-y-2">
                {alerts.slice(0, 2).map((alert, i) => (
                  <div key={i} className={`rounded-2xl p-4 border flex items-start gap-3 ${
                    alert.severity === "critical" ? "bg-rose-50/80 border-rose-200" : "bg-amber-50/80 border-amber-200"
                  }`}>
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.severity === "critical" ? "text-rose-600" : "text-amber-600"}`} />
                    <div>
                      <div className={`text-sm font-bold ${alert.severity === "critical" ? "text-rose-950" : "text-amber-950"}`}>{alert.title}</div>
                      <div className={`text-xs mt-0.5 leading-relaxed ${alert.severity === "critical" ? "text-rose-700" : "text-amber-700"}`}>{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nearby Risk Areas */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">Nearby Sectors</h2>
              <Link to="/map" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                View map <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden shadow-sm">
              {wards.slice(0, 3).map((ward, i) => {
                const wardReports = reports.filter(r => r.ward === ward.name);
                const risk = calculateRiskScore(wardReports);
                const cfg = RISK_LEVELS[risk.level];
                return (
                  <div key={i} className="p-4 flex items-center gap-3.5 hover:bg-zinc-50 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 truncate">{ward.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {wardReports.length} report{wardReports.length !== 1 ? 's' : ''} · {CONFIDENCE_LEVELS[risk.confidence]?.label}
                      </div>
                    </div>
                    <RiskBadge level={risk.level} size="sm" showIcon={false} />
                  </div>
                );
              })}
            </div>
            <div className="mt-2.5 bg-zinc-100/80 rounded-xl p-3 text-center text-xs text-zinc-500 border border-dashed border-zinc-300/80 flex items-center justify-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span>Absence of reports ≠ guaranteed safety.</span>
            </div>
          </section>

          {/* Safety Guidance */}
          <section>
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-3">Safety Protocol</h2>
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-zinc-900 text-sm">Conflict Avoidance Rules</span>
              </div>
              <ul className="space-y-2.5">
                {SAFETY_TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-zinc-600 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 font-mono font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Footer note */}
          <div className="text-center text-[11px] text-zinc-400 pt-2 pb-6 leading-relaxed">
            Pawlytics maps conflict patterns — not individual animals.
            <br />Risk scores are decision-support indicators.
          </div>
        </div>
      </div>

      <ArvEmergencyModal isOpen={showArvModal} onClose={() => setShowArvModal(false)} />
      <LocationSelectorModal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </div>
  );
}