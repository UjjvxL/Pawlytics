import { useState, useEffect } from "react";
import { hotspotsService } from "@/api/services";
import { MapContainer, TileLayer, Polyline, Circle } from "react-leaflet";
import { Navigation, ArrowRight, CheckCircle, Info } from "lucide-react";
import { RISK_LEVELS } from "@/lib/riskEngine";
import RiskBadge from "@/components/RiskBadge";
import "leaflet/dist/leaflet.css";

const DEMO_LOCATIONS = [
  "Sector 62 IT Hub",
  "Sector 18 Atta Market",
  "Sector 37 Main Road",
  "Sector 50 City Center",
  "Sector 93 Expressway Junction",
  "Sector 12 Community Market",
];

const ROUTE_COORDS = {
  "Sector 62 IT Hub|Sector 18 Atta Market": {
    routes: [
      {
        name: "Route A",
        label: "Via Sector 37 Main Road",
        path: [
          [28.6260, 77.3620],
          [28.6150, 77.3550],
          [28.5950, 77.3500],
          [28.5790, 77.3350],
          [28.5710, 77.3260],
        ],
        distance: 6.2,
        time: 22,
        color: "#DC2626",
        riskScore: 72,
        reportCount: 14,
        hotspotCount: 2,
      },
      {
        name: "Route B",
        label: "Via City Center Loop",
        path: [
          [28.6260, 77.3620],
          [28.6200, 77.3500],
          [28.6050, 77.3450],
          [28.5860, 77.3340],
          [28.5710, 77.3260],
        ],
        distance: 6.6,
        time: 24,
        color: "#16A34A",
        riskScore: 38,
        reportCount: 5,
        hotspotCount: 0,
      },
      {
        name: "Route C",
        label: "Via Service Road 16",
        path: [
          [28.6260, 77.3620],
          [28.6180, 77.3540],
          [28.6000, 77.3400],
          [28.5820, 77.3300],
          [28.5710, 77.3260],
        ],
        distance: 6.4,
        time: 20,
        color: "#D97706",
        riskScore: 55,
        reportCount: 9,
        hotspotCount: 1,
      },
    ],
  },
};

function getRiskLevel(score) {
  if (score < 20) return "low";
  if (score < 40) return "moderate";
  if (score < 60) return "elevated";
  return "high";
}

export default function RouteCheck() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hotspotsService.filter({ is_demo: true, is_active: true }).then(setHotspots);
  }, []);

  const handleCheck = () => {
    if (!from || !to) return;
    setLoading(true);
    setTimeout(() => {
      const key = `${from}|${to}`;
      const reverseKey = `${to}|${from}`;
      const data = ROUTE_COORDS[key] || ROUTE_COORDS[reverseKey] || null;
      setRouteData(data || generateFallbackRoutes(from, to));
      setSelected(0);
      setLoading(false);
    }, 900);
  };

  const generateFallbackRoutes = (from, to) => ({
    routes: [
      {
        name: "Route A", label: "Direct Route",
        path: [[28.5740, 77.3410], [28.5850, 77.3360], [28.5950, 77.3400]],
        distance: 3.2, time: 12, color: "#D97706", riskScore: 45, reportCount: 6, hotspotCount: 1,
      },
      {
        name: "Route B", label: "Alternate Route",
        path: [[28.5740, 77.3410], [28.5790, 77.3330], [28.5870, 77.3360]],
        distance: 3.8, time: 15, color: "#16A34A", riskScore: 22, reportCount: 3, hotspotCount: 0,
      },
    ],
  });

  const best = routeData ? [...routeData.routes].sort((a, b) => a.riskScore - b.riskScore)[0] : null;
  const mapCenter = [28.5850, 77.3410];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1a2744] px-4 pt-10 pb-5 text-white">
        <div className="font-bold text-xl font-display mb-1">Know Before You Go</div>
        <div className="text-blue-300 text-sm">Compare routes by recorded conflict exposure</div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Route inputs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">From</label>
              <select
                value={from}
                onChange={e => { setFrom(e.target.value); setRouteData(null); }}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
              >
                <option value="">Select starting point</option>
                {DEMO_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-slate-500 rotate-90" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">To</label>
              <select
                value={to}
                onChange={e => { setTo(e.target.value); setRouteData(null); }}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
              >
                <option value="">Select destination</option>
                {DEMO_LOCATIONS.filter(l => l !== from).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleCheck}
            disabled={!from || !to || loading}
            className="w-full mt-4 bg-blue-900 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Navigation className="w-4 h-4" /> Compare Routes</>
            )}
          </button>
        </div>

        {/* Important disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-blue-800">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            Route comparison shows <strong>recorded conflict exposure</strong> based on available verified reports.
            Lower exposure ≠ safe. Sparse data areas show Unknown risk.
          </div>
        </div>

        {/* Route results */}
        {routeData && (
          <div className="animate-fade-in space-y-3">
            {/* Recommendation */}
            {best && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800 text-sm">Lower Exposure Option</span>
                </div>
                <div className="text-green-700 text-sm">
                  <strong>{best.name}</strong> has lower recorded conflict exposure based on available data.
                  This is not a guarantee of safety.
                </div>
              </div>
            )}

            {/* Route cards */}
            {routeData.routes.map((route, i) => {
              const level = getRiskLevel(route.riskScore);
              const cfg = RISK_LEVELS[level];
              const isBest = route === best;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${selected === i ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{route.name}</span>
                      <span className="text-xs text-slate-500">{route.label}</span>
                      {isBest && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">Lower Exposure</span>}
                    </div>
                    <RiskBadge level={level} size="sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <div className="font-semibold text-slate-800">{route.distance} km</div>
                      <div className="text-xs text-slate-500">Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-slate-800">{route.time} min</div>
                      <div className="text-xs text-slate-500">Est. time</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold" style={{ color: cfg.color }}>{route.riskScore}/100</div>
                      <div className="text-xs text-slate-500">Exposure score</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>📋 {route.reportCount} reports along route</span>
                    <span>🔥 {route.hotspotCount} hotspot{route.hotspotCount !== 1 ? 's' : ''} intersected</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${route.riskScore}%`, backgroundColor: cfg.color }}
                    />
                  </div>
                </button>
              );
            })}

            {/* Map */}
            <div className="rounded-2xl overflow-hidden h-56 border border-slate-200">
              <MapContainer center={mapCenter} zoom={14} className="h-full w-full" zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {routeData.routes.map((route, i) => (
                  <Polyline
                    key={i}
                    positions={route.path}
                    pathOptions={{
                      color: i === selected ? "#1a2744" : route.color,
                      weight: i === selected ? 5 : 3,
                      opacity: i === selected ? 0.9 : 0.4,
                      dashArray: i === selected ? undefined : "6 4",
                    }}
                  />
                ))}
                {hotspots.map((h, i) => (
                  <Circle
                    key={i}
                    center={[h.center_lat, h.center_lng]}
                    radius={h.radius_meters || 180}
                    pathOptions={{ color: "#DC2626", fillColor: "#DC2626", fillOpacity: 0.15, weight: 1.5 }}
                  />
                ))}
              </MapContainer>
            </div>

            <div className="text-xs text-slate-400 text-center py-1">
              Conflict exposure scores are backward-looking estimates based on verified reports, not predictions.
              Always exercise caution regardless of route selected.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}