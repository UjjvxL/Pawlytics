import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { reportsService, hotspotsService, contextPOIsService } from "@/api/services";
import { RISK_LEVELS, CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/riskEngine";
import RiskBadge, { ConfidenceBadge } from "@/components/RiskBadge";
import { Filter, X, AlertTriangle, Phone, ShieldAlert, MapPin, Clock, Navigation, Sparkles, LocateFixed, ChevronDown, Home } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useGpsLocation } from "@/lib/gps";
import { useLocationState } from "@/lib/locationContext";
import LocationSelectorModal from "@/components/LocationSelectorModal";
import "leaflet/dist/leaflet.css";

// Fly map to user location or selected coordinates when changed
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1.2 });
  }, [position, map]);
  return null;
}

// Blue pulsing GPS dot
const gpsIcon = L.divIcon({
  html: `<div style="position:relative"><div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 12px rgba(59,130,246,0.6)"></div><div style="position:absolute;top:-6px;left:-6px;width:30px;height:30px;border-radius:50%;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);animation:pulse 2s infinite"></div></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Default fallback centered on Greater Noida
const DEMO_CENTER = [28.4650, 77.4950];

const POI_ICONS = {
  school: "🏫",
  hospital: "🏥",
  arv_facility: "🚨",
  vet_clinic: "🐾",
  waste_site: "🗑️",
  park: "🌳",
  feeding_zone: "🍖",
};

// Enhanced Severity Marker with Sighted Dog Count Badge
function createSeverityIcon(severity, dogCount = 1) {
  const colors = { 1: "#6B7280", 2: "#D97706", 3: "#EA580C", 4: "#DC2626", 5: "#991B1B" };
  const color = colors[severity] || "#6B7280";
  return L.divIcon({
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-center;">
        <div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>
        <div style="
          position: absolute;
          top: -12px;
          right: -14px;
          background: #0f172a;
          color: #38bdf8;
          border: 1px solid #0284c7;
          border-radius: 8px;
          padding: 1px 4px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 5px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          gap: 2px;
        ">
          🐕 ${dogCount}
        </div>
      </div>
    `,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function createPoiIcon(type) {
  const emoji = POI_ICONS[type] || "📍";
  const bg = type === "vet_clinic" ? "#10b981" : type === "arv_facility" ? "#e11d48" : type === "hospital" ? "#0284c7" : type === "school" ? "#8b5cf6" : "#64748b";
  return L.divIcon({
    html: `<div style="background:${bg};color:white;width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 3px 10px rgba(0,0,0,0.3);border:2px solid white;">${emoji}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
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
  const { userLocation, gpsLoading, requestLocation } = useGpsLocation();
  const { currentLocality, currentZone, coords } = useLocationState();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [timeFilter, setTimeFilter] = useState("30d");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showPois, setShowPois] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedSeverities, setSelectedSeverities] = useState([]);

  useEffect(() => {
    Promise.all([
      reportsService.filter({ is_demo: true }),
      hotspotsService.filter({ is_demo: true, is_active: true }),
      contextPOIsService.filter({ is_demo: true }),
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
    const ts = new Date(r.incident_timestamp || r.created_date || Date.now()).getTime();
    if (Date.now() - ts > getTimeMs()) return false;
    if (showVerifiedOnly && r.verification_status !== "verified") return false;
    if (selectedSeverities.length > 0 && !selectedSeverities.includes(r.severity_level)) return false;
    return true;
  });

  const totalSightedDogs = filteredReports.reduce((sum, r) => sum + (r.dog_count || 1), 0);

  const toggleSeverity = (v) => {
    setSelectedSeverities(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-950">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-slate-400 font-medium">Loading Greater Noida Conflict Intelligence Layer...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      {/* Map */}
      <MapContainer
        center={userLocation || coords || DEMO_CENTER}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Fly to active user location / selected coords */}
        <FlyToLocation position={userLocation || coords} />

        {/* GPS user location blue dot */}
        {userLocation && (
          <>
            <Circle center={userLocation} radius={80} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.08, weight: 1 }} />
            <Marker position={userLocation} icon={gpsIcon}>
              <Popup><div className="text-slate-900 text-xs font-semibold">📍 Your Location</div></Popup>
            </Marker>
          </>
        )}

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
                fillOpacity: 0.18,
                weight: 2,
                dashArray: "4 4",
              }}
              eventHandlers={{ click: () => { setSelectedHotspot(h); setSelectedPoi(null); } }}
            />
          );
        })}

        {/* Report markers with dog count badges */}
        {filteredReports.map((r, i) => {
          const isVerified = r.verification_status === "verified";
          return (
            <Marker
              key={i}
              position={[r.latitude, r.longitude]}
              icon={createSeverityIcon(r.severity_level, r.dog_count || 1)}
            >
              <Popup>
                <div className="min-w-[210px] text-slate-900">
                  <div className="font-bold text-sm text-slate-900 mb-1">{CATEGORY_LABELS[r.category] || "Incident Report"}</div>
                  <div className="text-xs text-slate-600 mb-1 flex items-center justify-between">
                    <span>{SEVERITY_LABELS[r.severity_level]?.label}</span>
                    <span className="font-bold text-slate-900 bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">🐕 {r.dog_count || 1} dogs</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-1.5">{r.location_label}</div>
                  {isVerified && (
                    <span className="inline-block text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold mb-1">✓ Verified Telemetry</span>
                  )}
                  <div className="text-xs text-slate-500">
                    {new Date(r.incident_timestamp).toLocaleDateString("en-IN")}
                  </div>
                  {r.description && (
                    <div className="text-xs text-slate-700 mt-2 border-t pt-2 leading-relaxed">{r.description}</div>
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
            eventHandlers={{ click: () => { setSelectedPoi(poi); setSelectedHotspot(null); } }}
          >
            <Popup>
              <div className="text-slate-900 min-w-[180px]">
                <div className="font-bold text-sm">{poi.name}</div>
                <div className="text-xs text-slate-600 capitalize">{poi.poi_type.replace("_", " ")} · {poi.ward}</div>
                {poi.phone && (
                  <div className="text-xs text-emerald-700 font-semibold mt-1">📞 {poi.phone}</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Top header overlay with Active Sighted Dogs Telemetry */}
      <div className="absolute top-0 left-0 right-0 z-[500] bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent px-4 pt-10 pb-6 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto max-w-lg mx-auto">
          <div>
            <button
              onClick={() => setShowLocationModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 mb-1 active:scale-95 transition-all cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{currentLocality} ({currentZone})</span>
              <ChevronDown className="w-3 h-3 text-emerald-400/70" />
            </button>
            <h1 className="text-white font-bold text-lg font-display">Live Risk & POI Map</h1>
            <p className="text-slate-300 text-xs font-medium flex items-center gap-1.5 mt-0.5">
              <span className="text-sky-400 font-bold bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-500/30">🐕 {totalSightedDogs} Sighted Dogs</span>
              <span>·</span>
              <span>{filteredReports.length} reports</span>
              <span>·</span>
              <span>{hotspots.length} hotspots</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md hover:bg-slate-800 active:scale-95 transition-all"
              title="Return to Home"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md active:scale-95 transition-all"
            >
              <Filter className="w-4 h-4 text-emerald-400" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Layer legend */}
      <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-2xl p-3 shadow-2xl hidden sm:block">
        <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Map POI & Risk Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-sky-400 font-bold text-[11px]">🐕 4</span> <span>Sighted Dogs Marker Badge</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-sm">🐾</span> <span>Vet Shops & Clinics</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-sm">🚨</span> <span>ARV Emergency Care</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-sm">🏥</span> <span>Hospitals</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-sm">🏫</span> <span>Schools & Campus</span>
          </div>
        </div>
      </div>

      {/* Quick Layer Toggles */}
      <div className="absolute bottom-4 right-4 z-[500] flex flex-col gap-2">
        <button
          onClick={requestLocation}
          disabled={gpsLoading}
          className={`px-3 py-2 rounded-xl text-xs font-bold shadow-xl transition-all backdrop-blur-md flex items-center gap-1.5 ${userLocation ? "bg-blue-500 text-white" : "bg-slate-900/90 text-blue-400 border border-slate-800"}`}
        >
          {gpsLoading ? <div className="w-4 h-4 border-2 border-blue-300 border-t-white rounded-full animate-spin" /> : <LocateFixed className="w-4 h-4" />}
          {gpsLoading ? "Locating..." : "My Location"}
        </button>
        <button
          onClick={() => setShowHotspots(!showHotspots)}
          className={`px-3 py-2 rounded-xl text-xs font-bold shadow-xl transition-all backdrop-blur-md ${showHotspots ? "bg-rose-600 text-white" : "bg-slate-900/90 text-slate-400 border border-slate-800"}`}
        >
          🔥 Hotspots
        </button>
        <button
          onClick={() => setShowPois(!showPois)}
          className={`px-3 py-2 rounded-xl text-xs font-bold shadow-xl transition-all backdrop-blur-md ${showPois ? "bg-emerald-500 text-slate-950" : "bg-slate-900/90 text-slate-400 border border-slate-800"}`}
        >
          🐾 Vet & Hospitals
        </button>
      </div>

      {/* Filter Side Panel */}
      {showFilters && (
        <div className="absolute top-0 right-0 bottom-0 z-[1600] w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="font-bold text-white text-base">Map Layers & Filter</h2>
            <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Time Window</div>
              <div className="grid grid-cols-4 gap-2">
                {TIME_FILTERS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${timeFilter === t ? "bg-emerald-500 text-slate-950" : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Severity Level</div>
              <div className="space-y-2">
                {SEVERITY_FILTERS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => toggleSeverity(s.value)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${selectedSeverities.includes(s.value) ? "bg-slate-800 border border-emerald-500/50 text-emerald-400" : "bg-slate-950 border border-slate-800 text-slate-400"}`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SEVERITY_LABELS[s.value]?.color }} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected POI Emergency Bottom Sheet Drawer */}
      {selectedPoi && (
        <div className="absolute bottom-4 left-4 right-4 z-[1500] bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 max-w-md mx-auto">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                {POI_ICONS[selectedPoi.poi_type] || "📍"}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{selectedPoi.name}</h3>
                <p className="text-xs text-slate-400 capitalize">{selectedPoi.poi_type.replace("_", " ")} · {selectedPoi.ward}</p>
              </div>
            </div>
            <button onClick={() => setSelectedPoi(null)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs text-slate-300 mb-4">
            {selectedPoi.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <span>{selectedPoi.address}</span>
              </div>
            )}
            {selectedPoi.hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>{selectedPoi.hours}</span>
              </div>
            )}
            {selectedPoi.services && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400 mt-2">
                <strong className="text-slate-200 block mb-1">Services & Care:</strong>
                {selectedPoi.services}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selectedPoi.phone && (
              <a
                href={`tel:${selectedPoi.phone.replace(/[^0-9+]/g, '')}`}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-500/20"
              >
                <Phone className="w-4 h-4" /> Call Clinic
              </a>
            )}
            {selectedPoi.emergency_contact ? (
              <a
                href={`tel:${selectedPoi.emergency_contact.replace(/[^0-9+]/g, '')}`}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-rose-600/20"
              >
                <ShieldAlert className="w-4 h-4" /> 24/7 Emergency
              </a>
            ) : (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPoi.name + " Greater Noida")}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-xs"
              >
                <Navigation className="w-4 h-4" /> Directions
              </a>
            )}
          </div>
        </div>
      )}

      {/* Selected Hotspot Bottom Sheet Drawer */}
      {selectedHotspot && (
        <div className="absolute bottom-4 left-4 right-4 z-[1500] bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 max-w-md mx-auto">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Conflict Hotspot Zone</span>
              </div>
              <h3 className="font-bold text-white text-base">{selectedHotspot.name}</h3>
            </div>
            <button onClick={() => setSelectedHotspot(null)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-3">
              <RiskBadge level={selectedHotspot.risk_level} />
              <ConfidenceBadge confidence={selectedHotspot.confidence} />
            </div>
            <p className="text-slate-400 leading-relaxed pt-1">{selectedHotspot.explanation}</p>
          </div>
        </div>
      )}

      <LocationSelectorModal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </div>
  );
}