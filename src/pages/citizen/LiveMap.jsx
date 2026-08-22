import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, Marker } from "react-leaflet";
import L from "leaflet";
import { base44 } from "@/api/base44Client";
import { RISK_LEVELS, CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/riskEngine";
import RiskBadge, { ConfidenceBadge } from "@/components/RiskBadge";
import { Filter, X, AlertTriangle } from "lucide-react";
import { useTheme } from "@/lib/theme";
import "leaflet/dist/leaflet.css";

const DEMO_CENTER = [28.5740, 77.3410];

const POI_COLORS = {
  school: "#3B82F6",
  hospital: "#10B981",
  waste_site: "#F59E0B",
  park: "#6EE7B7",
  arv_facility: "#8B5CF6",
  feeding_zone: "#F97316",
  road: "#94A3B8",
};

const POI_ICONS = {
  school: "🏫",
  hospital: "🏥",
  waste_site: "🗑️",
  park: "🌳",
  arv_facility: "💉",
  feeding_zone: "🍖",
  road: "🚗",
};

function createSeverityIcon(severity) {
  const colors = { 1: "#6B7280", 2: "#D97706", 3: "#EA580C", 4: "#DC2626", 5: "#991B1B" };
  const color = colors[severity] || "#6B7280";
  return L.divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function createPoiIcon(type) {
  const emoji = POI_ICONS[type] || "📍";
  return L.divIcon({
    html: `<div style="font-size:16px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4))">${emoji}</div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const TIME_FILTERS = ["24h", "7d", "30d", "90d"];
const SEVERITY_FILTERS = [
  { value: 1, label: "L1 Sighting" },
  { value: 2, label: "L2 Approach" },
  { value: 3, label: "L3 Chase" },
  { value: 4, label: "L4 Aggressive" },
  { value: 5, label: "L5 Bite" },
];

export default function LiveMap() {
  const { theme } = useTheme();
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [timeFilter, setTimeFilter] = useState("30d");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showPois, setShowPois] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedSeverities, setSelectedSeverities] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Report.filter({ is_demo: true }),
      base44.entities.Hotspot.filter({ is_demo: true, is_active: true }),
      base44.entities.ContextPOI.filter({ is_demo: true }),
    ]).then(([r, h, p]) => {
      setReports(r);
      setHotspots(h);
      setPois(p);
      setLoading(false);
    });
  }, []);

  const getTimeMs = () => {
    const map = { "24h": 86400000, "7d": 604800000, "30d": 2592000000, "90d": 7776000000 };
    return map[timeFilter] || 2592000000;
  };

  const filteredReports = reports.filter(r => {
    const ts = new Date(r.incident_timestamp || r.created_date).getTime();
    if (Date.now() - ts > getTimeMs()) return false;
    if (showVerifiedOnly && r.verification_status !== "verified") return false;
    if (selectedSeverities.length > 0 && !selectedSeverities.includes(r.severity_level)) return false;
    return true;
  });

  const toggleSeverity = (v) => {
    setSelectedSeverities(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-400 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-slate-400">Loading conflict intelligence layer...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map */}
      <MapContainer
        center={DEMO_CENTER}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url={theme === "dark"
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Hotspot circles */}
        {showHotspots && hotspots.map((h, i) => {
          const cfg = RISK_LEVELS[h.risk_level] || RISK_LEVELS.unknown;
          return (
            <Circle
              key={i}
              center={[h.center_lat, h.center_lng]}
              radius={h.radius_meters || 200}
              pathOptions={{
                color: cfg.color,
                fillColor: cfg.color,
                fillOpacity: 0.15,
                weight: 2,
                dashArray: "4 4",
              }}
              eventHandlers={{ click: () => setSelectedHotspot(h) }}
            />
          );
        })}

        {/* Report markers */}
        {filteredReports.map((r, i) => {
          const isVerified = r.verification_status === "verified";
          return (
            <Marker
              key={i}
              position={[r.latitude, r.longitude]}
              icon={createSeverityIcon(r.severity_level)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-slate-800 mb-1">{CATEGORY_LABELS[r.category]}</div>
                  <div className="text-xs text-slate-500 mb-2">
                    {SEVERITY_LABELS[r.severity_level]?.label} · {r.location_label}
                  </div>
                  {isVerified && (
                    <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mb-1">✓ Verified</div>
                  )}
                  <div className="text-xs text-slate-400">
                    {new Date(r.incident_timestamp).toLocaleDateString("en-IN")}
                  </div>
                  {r.description && (
                    <div className="text-xs text-slate-600 mt-2 border-t pt-2">{r.description}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* POI markers */}
        {showPois && pois.map((poi, i) => (
          <Marker
            key={i}
            position={[poi.latitude, poi.longitude]}
            icon={createPoiIcon(poi.poi_type)}
          >
            <Popup>
              <div>
                <div className="font-medium text-slate-800 text-sm">{poi.name}</div>
                <div className="text-xs text-slate-500 capitalize mt-0.5">{poi.poi_type.replace("_", " ")}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Top header overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-slate-900/80 to-transparent px-4 pt-10 pb-6 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div>
            <div className="text-white font-bold text-lg font-display">Live Risk Map</div>
            <div className="text-slate-300 text-xs">{filteredReports.length} reports · {hotspots.length} hotspots</div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-2 rounded-xl text-sm font-medium shadow-lg"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-24 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
        <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Risk Level</div>
        {Object.entries(RISK_LEVELS).slice(1).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: val.color }} />
            <span className="text-xs text-slate-600">{val.label}</span>
          </div>
        ))}
        <div className="border-t border-slate-200 mt-2 pt-2 text-xs text-slate-400">
          ● Incident · ◯ Hotspot zone
        </div>
      </div>

      {/* Layer toggles */}
      <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setShowHotspots(!showHotspots)}
          className={`px-3 py-2 rounded-xl text-xs font-medium shadow-lg transition-colors ${showHotspots ? "bg-orange-600 text-white" : "bg-white/90 text-slate-600"}`}
        >
          🔥 Hotspots
        </button>
        <button
          onClick={() => setShowPois(!showPois)}
          className={`px-3 py-2 rounded-xl text-xs font-medium shadow-lg transition-colors ${showPois ? "bg-blue-700 text-white" : "bg-white/90 text-slate-600"}`}
        >
          📍 Layers
        </button>
        <button
          onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
          className={`px-3 py-2 rounded-xl text-xs font-medium shadow-lg transition-colors ${showVerifiedOnly ? "bg-green-600 text-white" : "bg-white/90 text-slate-600"}`}
        >
          ✓ Verified
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="absolute top-0 right-0 bottom-0 z-[1001] w-72 bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Map Filters</h2>
            <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Time Window</div>
              <div className="grid grid-cols-4 gap-1.5">
                {TIME_FILTERS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${timeFilter === t ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Severity Level</div>
              <div className="space-y-1.5">
                {SEVERITY_FILTERS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => toggleSeverity(s.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedSeverities.includes(s.value) ? "bg-blue-50 border border-blue-200 text-blue-800" : "bg-slate-50 border border-transparent text-slate-600 hover:bg-slate-100"}`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEVERITY_LABELS[s.value]?.color }} />
                    {s.label}
                  </button>
                ))}
                {selectedSeverities.length > 0 && (
                  <button onClick={() => setSelectedSeverities([])} className="text-xs text-slate-500 underline">Clear severity filter</button>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Layers</div>
              <div className="space-y-2">
                {[["showHotspots", showHotspots, setShowHotspots, "Hotspot zones"], ["showPois", showPois, setShowPois, "Context POIs (schools, waste, etc.)"], ["showVerifiedOnly", showVerifiedOnly, setShowVerifiedOnly, "Verified reports only"]].map(([k, val, setter, label]) => (
                  <label key={k} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setter(!val)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${val ? "bg-blue-900" : "bg-slate-200"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-sm text-slate-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotspot detail panel */}
      {selectedHotspot && (
        <div className="absolute bottom-20 left-4 right-4 z-[1001] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-start justify-between p-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-600 uppercase tracking-wider">Conflict Hotspot</span>
              </div>
              <div className="font-semibold text-slate-800">{selectedHotspot.name}</div>
            </div>
            <button onClick={() => setSelectedHotspot(null)} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <RiskBadge level={selectedHotspot.risk_level} />
              <ConfidenceBadge confidence={selectedHotspot.confidence} />
            </div>
            <div className="text-sm text-slate-600 mb-3">
              {selectedHotspot.verified_report_count} verified report{selectedHotspot.verified_report_count !== 1 ? 's' : ''} in the last {selectedHotspot.time_window_days} days.
              Multiple conflict reports have been recorded around this location.
            </div>
            {selectedHotspot.time_pattern && (
              <div className="flex items-start gap-2 text-sm text-slate-500 mb-2">
                <span>⏱</span> {selectedHotspot.time_pattern}
              </div>
            )}
            {selectedHotspot.group_presence_count > 0 && (
              <div className="flex items-start gap-2 text-sm text-slate-500 mb-2">
                <span>🐕</span> {selectedHotspot.group_presence_count} reports involved group presence
              </div>
            )}
            {selectedHotspot.nearby_factors?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedHotspot.nearby_factors.map((f, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            )}
            <div className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              Risk estimates are based on verified historical reports and should not be interpreted as predictions of individual animal behavior.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}