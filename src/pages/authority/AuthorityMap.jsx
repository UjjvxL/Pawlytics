import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { reportsService, hotspotsService, contextPOIsService } from "@/api/services";
import { RISK_LEVELS, CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/riskEngine";
import RiskBadge from "@/components/RiskBadge";
import { useTheme } from "@/lib/theme";
import "leaflet/dist/leaflet.css";

const DEMO_CENTER = [28.5740, 77.3410];

function createIncidentIcon(severity, verified) {
  const colors = { 1: "#6B7280", 2: "#D97706", 3: "#EA580C", 4: "#DC2626", 5: "#991B1B" };
  const color = colors[severity] || "#6B7280";
  const border = verified ? "3px solid #16A34A" : "2px solid white";
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:${border};box-shadow:0 2px 6px rgba(0,0,0,0.25)"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function AuthorityMap() {
  const { theme } = useTheme();
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showPois, setShowPois] = useState(true);
  const [timeWindow, setTimeWindow] = useState(30);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

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

  const filteredReports = reports.filter(r => {
    const ms = new Date(r.incident_timestamp || r.created_date).getTime();
    return Date.now() - ms < timeWindow * 24 * 60 * 60 * 1000;
  });

  const POI_ICONS = { school: "🏫", hospital: "🏥", waste_site: "🗑️", park: "🌳", arv_facility: "💉", feeding_zone: "🍖" };

  const createPoiIcon = (type) => L.divIcon({
    html: `<div style="font-size:14px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5))">${POI_ICONS[type] || "📍"}</div>`,
    className: "", iconSize: [20, 20], iconAnchor: [10, 10],
  });

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">Live Conflict Risk Map</h1>
        <p className="text-slate-500 text-sm mt-1">{filteredReports.length} reports · {hotspots.length} hotspots visible</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 flex-wrap">
        <div className="flex gap-1">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setTimeWindow(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeWindow === d ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {d}d
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          {[["Hotspots", showHotspots, setShowHotspots], ["Context POIs", showPois, setShowPois], ["All reports", showAll, setShowAll]].map(([l, v, s]) => (
            <label key={l} className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => s(!v)} className={`w-8 h-4 rounded-full relative transition-colors ${v ? "bg-blue-900" : "bg-slate-300"}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${v ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-slate-600">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-slate-200" style={{ height: "520px" }}>
        <MapContainer center={DEMO_CENTER} zoom={14} className="h-full w-full">
          <TileLayer url={theme === "dark" ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"} attribution='&copy; OpenStreetMap contributors &copy; CARTO' />

          {/* Hotspot circles */}
          {showHotspots && hotspots.map((h, i) => {
            const cfg = RISK_LEVELS[h.risk_level] || RISK_LEVELS.unknown;
            return (
              <Circle key={i} center={[h.center_lat, h.center_lng]} radius={h.radius_meters || 200}
                pathOptions={{ color: cfg.color, fillColor: cfg.color, fillOpacity: 0.18, weight: 2, dashArray: "4 4" }}
                eventHandlers={{ click: () => setSelectedHotspot(h) }}
              >
                <Popup>
                  <div className="min-w-[220px]">
                    <div className="font-bold text-slate-800 mb-1">{h.name}</div>
                    <div className="mb-2"><RiskBadge level={h.risk_level} size="sm" /></div>
                    <div className="text-xs text-slate-600 mb-1">
                      {h.verified_report_count} verified reports · {h.confidence} confidence
                    </div>
                    <div className="text-xs text-slate-500">{h.time_pattern}</div>
                    <div className="text-xs text-slate-400 mt-2 border-t pt-2">{h.explanation?.slice(0, 100)}...</div>
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* Reports */}
          {showAll && filteredReports.map((r, i) => (
            <Marker key={i} position={[r.latitude, r.longitude]} icon={createIncidentIcon(r.severity_level, r.verification_status === "verified")}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-semibold text-slate-800 mb-1">{CATEGORY_LABELS[r.category]}</div>
                  <div className="text-xs text-slate-500 mb-2">{SEVERITY_LABELS[r.severity_level]?.label}</div>
                  <div className="text-xs">{r.location_label}</div>
                  <div className="text-xs text-slate-400">{new Date(r.incident_timestamp).toLocaleString("en-IN")}</div>
                  {r.verification_status === "verified" && <div className="text-xs text-green-600 mt-1 font-medium">✓ Verified</div>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* POIs */}
          {showPois && pois.map((poi, i) => (
            <Marker key={i} position={[poi.latitude, poi.longitude]} icon={createPoiIcon(poi.poi_type)}>
              <Popup>
                <div className="font-medium text-slate-800 text-sm">{poi.name}</div>
                <div className="text-xs text-slate-500 capitalize mt-0.5">{poi.poi_type.replace("_", " ")}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Risk Level Legend</div>
        <div className="flex flex-wrap gap-4">
          {Object.entries(RISK_LEVELS).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: cfg.color, opacity: 0.7 }} />
              <span className="text-sm text-slate-600">{cfg.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
          Green border on incident = Verified · No border = Pending review · Dashed circle = Hotspot zone
        </div>
      </div>
    </div>
  );
}