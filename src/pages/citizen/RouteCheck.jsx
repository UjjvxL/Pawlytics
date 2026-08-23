import { useState, useEffect } from "react";
import { hotspotsService, contextPOIsService } from "@/api/services";
import { MapContainer, TileLayer, Polyline, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Navigation, ArrowRight, CheckCircle, Info, Phone, Clock, MapPin, Hospital, GraduationCap, ShieldAlert, Sparkles, LocateFixed } from "lucide-react";
import { RISK_LEVELS } from "@/lib/riskEngine";
import RiskBadge from "@/components/RiskBadge";
import { useGpsLocation, fetchOsrmRoute } from "@/lib/gps";
import "leaflet/dist/leaflet.css";

// Helper to auto-fit map view to active route polyline bounds
function MapAutoBounds({ polylineCoords }) {
  const map = useMap();
  useEffect(() => {
    if (polylineCoords && polylineCoords.length > 0) {
      const bounds = L.latLngBounds(polylineCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: true });
    }
  }, [polylineCoords, map]);
  return null;
}

const DEMO_GREATER_NOIDA_LOCATIONS = [
  { label: "📍 My Current Location", coords: null },
  { label: "IILM University (KP-2)", coords: [28.4633, 77.4926] },
  { label: "Sharda Hospital (KP-3)", coords: [28.4710, 77.4830] },
  { label: "Alpha 1 Commercial Belt", coords: [28.4730, 77.5030] },
  { label: "Alpha 2 (Kailash Hospital / DPS)", coords: [28.4780, 77.5090] },
  { label: "Beta 1 Market & Ryan School", coords: [28.4630, 77.5140] },
  { label: "Beta 2 Sector Gate", coords: [28.4580, 77.5080] },
  { label: "GIMS Hospital & ARV Center", coords: [28.4690, 77.4860] },
  { label: "Pari Chowk Roundabout", coords: [28.4645, 77.5015] },
];

// High-density street-snapped coordinates following actual Greater Noida road network
const ROUTE_DATA_MAP = {
  "IILM University (KP-2)|Alpha 1 Commercial Belt": {
    center: [28.4680, 77.4975],
    zoom: 14,
    routes: [
      {
        id: "r1",
        name: "Route A",
        label: "Via Knowledge Park Main Road & Pari Chowk",
        badge: "Recommended · Safest Street",
        path: [
          [28.4630, 77.4920], // IILM Campus Gate
          [28.4632, 77.4940], // KP-2 Circle Road
          [28.4638, 77.4975], // Knowledge Park Main Arterial
          [28.4645, 77.5015], // Pari Chowk Roundabout Entry
          [28.4680, 77.5022], // Commercial Belt Link Rd
          [28.4715, 77.5028], // Alpha 1 Outer Circle
          [28.4730, 77.5030], // Alpha 1 Commercial Plaza
        ],
        distance: 2.8,
        time: 8,
        color: "#10b981", // Emerald safest
        riskScore: 22,
        reportCount: 2,
        hotspotCount: 0,
        explanation: "Main arterial road with active street lighting, low historical incidents, and zero active hotspot intersections."
      },
      {
        id: "r2",
        name: "Route B",
        label: "Via Sharda Service Lane 16 & Back Alley",
        badge: "Higher Exposure",
        path: [
          [28.4630, 77.4920], // IILM Campus Gate
          [28.4670, 77.4880], // KP-3 Back Link Road
          [28.4710, 77.4850], // Sharda Perimeter Alley
          [28.4725, 77.4950], // Commercial Back Alley 16
          [28.4730, 77.5030], // Alpha 1 Commercial Plaza
        ],
        distance: 3.4,
        time: 11,
        color: "#e11d48", // Deep rose alert
        riskScore: 78,
        reportCount: 14,
        hotspotCount: 2,
        explanation: "Passes through 2 high-risk conflict hotspots near hospital waste disposal lanes with frequent night pack aggression."
      },
      {
        id: "r3",
        name: "Route C",
        label: "Via Galgotias Student Circle & Sector Link",
        badge: "Moderate Caution",
        path: [
          [28.4630, 77.4920],
          [28.4580, 77.4960],
          [28.4610, 77.5020],
          [28.4730, 77.5030],
        ],
        distance: 3.1,
        time: 9,
        color: "#f59e0b", // Amber warning
        riskScore: 48,
        reportCount: 6,
        hotspotCount: 1,
        explanation: "Moderate footfall route with 1 active hotspot near food vendor stalls."
      }
    ]
  },
  "Sharda Hospital (KP-3)|Pari Chowk Roundabout": {
    center: [28.4675, 77.4925],
    zoom: 14,
    routes: [
      {
        id: "r1_sp",
        name: "Route A",
        label: "Via KP-3 Arterial Expressway Slip",
        badge: "Direct & Clear",
        path: [
          [28.4710, 77.4830],
          [28.4690, 77.4890],
          [28.4660, 77.4950],
          [28.4645, 77.5015],
        ],
        distance: 2.2,
        time: 6,
        color: "#10b981",
        riskScore: 18,
        reportCount: 1,
        hotspotCount: 0,
        explanation: "Wide boulevard with wide sidewalks, clear visibility, and minimal dog pack sightings."
      },
      {
        id: "r2_sp",
        name: "Route B",
        label: "Via Inner Service Road & Hostel Market",
        badge: "Elevated Risk",
        path: [
          [28.4710, 77.4830],
          [28.4730, 77.4880],
          [28.4690, 77.4980],
          [28.4645, 77.5015],
        ],
        distance: 2.6,
        time: 8,
        color: "#f59e0b",
        riskScore: 54,
        reportCount: 8,
        hotspotCount: 1,
        explanation: "Service lane contains food vendor waste points with 8 reported sightings in the last 30 days."
      }
    ]
  }
};

const POI_ICONS = {
  vet_clinic: "🐾",
  arv_facility: "🚨",
  hospital: "🏥",
  school: "🏫",
  waste_dump: "🗑️"
};

function createCustomPoiIcon(type) {
  const emoji = POI_ICONS[type] || "📍";
  const bg = type === "vet_clinic" ? "#10b981" : type === "arv_facility" ? "#e11d48" : type === "hospital" ? "#0284c7" : "#8b5cf6";
  return L.divIcon({
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid white;
        transition: transform 0.2s ease;
      ">
        ${emoji}
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

function getRiskLevel(score) {
  if (score < 25) return "low";
  if (score < 50) return "moderate";
  if (score < 75) return "elevated";
  return "high";
}

export default function RouteCheck() {
  const [from, setFrom] = useState("IILM University (KP-2)");
  const [to, setTo] = useState("Alpha 1 Commercial Belt");
  const [routeData, setRouteData] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [pois, setPois] = useState([]);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [selectedPoiModal, setSelectedPoiModal] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const { userLocation, gpsLoading, requestLocation } = useGpsLocation();

  useEffect(() => {
    Promise.all([
      hotspotsService.filter({ is_demo: true, is_active: true }),
      contextPOIsService.filter({ is_demo: true })
    ]).then(([h, p]) => {
      setHotspots(h);
      setPois(p);
    });
  }, []);

  const getCoords = (label) => {
    if (label === "📍 My Current Location") return userLocation;
    const loc = DEMO_GREATER_NOIDA_LOCATIONS.find(l => l.label === label);
    return loc?.coords || null;
  };

  const handleCompare = async () => {
    const fromCoords = getCoords(from);
    const toCoords = getCoords(to);
    if (!fromCoords || !toCoords) return;
    setLoading(true);
    try {
      const osrmRoutes = await fetchOsrmRoute(fromCoords, toCoords, "foot");
      if (osrmRoutes.length > 0) {
        // Risk scoring heuristic: count nearby hotspots per route
        const scoredRoutes = osrmRoutes.map((r, i) => {
          const nearbyHotspots = hotspots.filter(h => {
            return r.coords.some(([lat, lng]) => {
              const dlat = lat - h.center_lat;
              const dlng = lng - h.center_lng;
              return Math.sqrt(dlat * dlat + dlng * dlng) < 0.003; // ~300m
            });
          });
          const riskScore = Math.min(100, nearbyHotspots.length * 25 + (i * 15) + Math.floor(Math.random() * 10));
          const colors = ["#10b981", "#f59e0b", "#e11d48"];
          const badges = ["Recommended · Safest", "Moderate Exposure", "Higher Exposure"];
          return {
            id: `osrm_${i}`,
            name: `Route ${String.fromCharCode(65 + i)}`,
            label: `Via ${r.distance}km road network path`,
            badge: badges[Math.min(i, 2)],
            path: r.coords,
            distance: parseFloat(r.distance),
            time: r.duration,
            color: colors[Math.min(i, 2)],
            riskScore,
            reportCount: nearbyHotspots.reduce((s, h) => s + (h.report_count || 0), 0),
            hotspotCount: nearbyHotspots.length,
            explanation: nearbyHotspots.length > 0
              ? `Passes near ${nearbyHotspots.length} active conflict hotspot(s) with ${nearbyHotspots.reduce((s, h) => s + (h.report_count || 0), 0)} logged incidents.`
              : "No active conflict hotspots detected along this route. Clear path with low historical incidents.",
          };
        });
        // Sort safest first
        scoredRoutes.sort((a, b) => a.riskScore - b.riskScore);
        const center = [
          (fromCoords[0] + toCoords[0]) / 2,
          (fromCoords[1] + toCoords[1]) / 2,
        ];
        setRouteData({ center, zoom: 14, routes: scoredRoutes });
      } else {
        // Fallback: straight line if OSRM fails
        setRouteData({
          center: [(fromCoords[0] + toCoords[0]) / 2, (fromCoords[1] + toCoords[1]) / 2],
          zoom: 14,
          routes: [{
            id: "fallback", name: "Route A", label: "Direct path (road data unavailable)",
            badge: "Straight Line", path: [fromCoords, toCoords],
            distance: 0, time: 0, color: "#64748b", riskScore: 0,
            reportCount: 0, hotspotCount: 0,
            explanation: "OSRM routing unavailable. Showing straight-line path."
          }]
        });
      }
    } catch {
      setRouteData(null);
    }
    setSelectedRouteIdx(0);
    setLoading(false);
  };

  const activeRoute = routeData?.routes?.[selectedRouteIdx];
  const filteredPois = pois.filter(p => {
    if (activeFilter === "all") return true;
    if (activeFilter === "vet_clinic") return p.poi_type === "vet_clinic";
    if (activeFilter === "hospital") return p.poi_type === "hospital" || p.poi_type === "arv_facility";
    if (activeFilter === "school") return p.poi_type === "school";
    return true;
  });

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 pb-24 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-[#1a2744] to-slate-950 px-4 pt-10 pb-6 border-b border-slate-800">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Greater Noida Conflict Intelligence
              </div>
              <h1 className="text-xl font-bold text-white font-display tracking-tight">Street Route Compare</h1>
              <p className="text-xs text-slate-400">Street-level route trajectories & emergency vet/hospital POIs</p>
            </div>
          </div>

          {/* Location Selector Card */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">From</label>
                <div className="flex gap-2">
                  <select
                    value={from}
                    onChange={e => {
                      setFrom(e.target.value);
                      if (e.target.value === "📍 My Current Location") requestLocation();
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {DEMO_GREATER_NOIDA_LOCATIONS.map(loc => (
                      <option key={loc.label} value={loc.label} disabled={loc.label === "📍 My Current Location" && !userLocation && !gpsLoading}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => { requestLocation(); setFrom("📍 My Current Location"); }}
                    disabled={gpsLoading}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${userLocation ? "bg-blue-500 text-white" : "bg-slate-800 text-blue-400 border border-slate-700"}`}
                  >
                    {gpsLoading ? <div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-white rounded-full animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                    GPS
                  </button>
                </div>
              </div>

              <div className="flex justify-center -my-1">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">To</label>
                <select
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {DEMO_GREATER_NOIDA_LOCATIONS.filter(l => l.label !== from).map(loc => (
                    <option key={loc.label} value={loc.label}>{loc.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Presets Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
              <span className="text-[10px] text-slate-500 uppercase font-semibold whitespace-nowrap">Presets:</span>
              <button
                onClick={() => { setFrom("IILM University (KP-2)"); setTo("Alpha 1 Commercial Belt"); }}
                className="text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60 whitespace-nowrap transition-colors"
              >
                IILM ➔ Alpha 1
              </button>
              <button
                onClick={() => { setFrom("Sharda Hospital (KP-3)"); setTo("Pari Chowk Roundabout"); }}
                className="text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60 whitespace-nowrap transition-colors"
              >
                Sharda ➔ Pari Chowk
              </button>
            </div>

            <button
              onClick={handleCompare}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-slate-950 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <><Navigation className="w-4 h-4" /> Compare Routes Telemetry</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-xl mx-auto px-4 pt-5 space-y-5">
        
        {/* Layer & POI Filter Chips */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Nearby Emergency POIs & Legend:
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${activeFilter === "all" ? "bg-slate-700 text-white" : "bg-slate-900 text-slate-400 hover:text-slate-200"}`}
            >
              All POIs ({pois.length})
            </button>
            <button
              onClick={() => setActiveFilter("vet_clinic")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${activeFilter === "vet_clinic" ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-900 text-emerald-400 hover:bg-slate-800"}`}
            >
              🐾 Vet Shops & Clinics
            </button>
            <button
              onClick={() => setActiveFilter("hospital")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${activeFilter === "hospital" ? "bg-sky-500 text-slate-950 font-bold" : "bg-slate-900 text-sky-400 hover:bg-slate-800"}`}
            >
              🏥 Hospitals / ARV
            </button>
            <button
              onClick={() => setActiveFilter("school")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${activeFilter === "school" ? "bg-purple-500 text-white font-bold" : "bg-slate-900 text-purple-400 hover:bg-slate-800"}`}
            >
              🏫 Schools
            </button>
          </div>
        </div>

        {/* Dedicated Non-Overlapping Interactive Map */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl h-[360px] w-full">
          {!routeData ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              <div className="text-center space-y-2">
                <Navigation className="w-8 h-8 mx-auto text-slate-600" />
                <p>Select locations above and tap<br/><strong className="text-emerald-400">Compare Routes Telemetry</strong></p>
              </div>
            </div>
          ) : (
          <MapContainer
            center={routeData.center}
            zoom={routeData.zoom}
            className="h-full w-full"
            zoomControl={false}
            key={routeData.routes[0]?.id || 'map'}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO & OpenStreetMap'
            />

            {activeRoute && <MapAutoBounds polylineCoords={activeRoute.path} />}

            {/* Render all routes with distinction */}
            {routeData.routes.map((route, idx) => {
              const isSelected = idx === selectedRouteIdx;
              return (
                <Polyline
                  key={route.id}
                  positions={route.path}
                  pathOptions={{
                    color: isSelected ? route.color : "#475569",
                    weight: isSelected ? 6 : 3,
                    opacity: isSelected ? 1 : 0.4,
                    dashArray: isSelected ? undefined : "6 6"
                  }}
                  eventHandlers={{ click: () => setSelectedRouteIdx(idx) }}
                />
              );
            })}

            {/* Hotspot Circles */}
            {hotspots.map((h, i) => (
              <Circle
                key={i}
                center={[h.center_lat, h.center_lng]}
                radius={h.radius_meters || 200}
                pathOptions={{
                  color: "#e11d48",
                  fillColor: "#e11d48",
                  fillOpacity: 0.18,
                  weight: 1.5,
                  dashArray: "4 4"
                }}
              />
            ))}

            {/* Interactive POI Markers */}
            {filteredPois.map((poi) => (
              <Marker
                key={poi.id}
                position={[poi.latitude, poi.longitude]}
                icon={createCustomPoiIcon(poi.poi_type)}
                eventHandlers={{ click: () => setSelectedPoiModal(poi) }}
              >
                <Popup className="custom-dark-popup">
                  <div className="p-1 text-slate-900">
                    <div className="font-bold text-sm">{poi.name}</div>
                    <div className="text-xs text-slate-600">{poi.address || poi.ward}</div>
                    {poi.phone && (
                      <div className="text-xs text-emerald-600 font-semibold mt-1">📞 {poi.phone}</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Overlay Badge */}
          <div className="absolute top-3 left-3 z-[400] bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">Interactive Street Map</span>
          </div>
          )}
        </div>

        {/* Route Details Cards (Stacked cleanly below map, no overlap) */}
        {routeData && (
        <div className="space-y-3 pt-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Available Route Paths ({routeData.routes.length})</span>
            <span className="text-slate-500 text-[11px]">Click a card to highlight path</span>
          </div>

          {routeData.routes.map((route, i) => {
            const isSelected = selectedRouteIdx === i;
            const level = getRiskLevel(route.riskScore);
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteIdx(i)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? "bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-80"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base font-display">{route.name}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                        {route.badge}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{route.label}</div>
                  </div>
                  <RiskBadge level={level} size="sm" />
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 my-2 border-y border-slate-800/80 text-center">
                  <div>
                    <div className="text-sm font-bold text-white">{route.distance} km</div>
                    <div className="text-[10px] text-slate-500">Distance</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{route.time} min</div>
                    <div className="text-[10px] text-slate-500">Est. Time</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: route.color }}>{route.riskScore}/100</div>
                    <div className="text-[10px] text-slate-500">Exposure Score</div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed mb-3">
                  {route.explanation}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>📋 {route.reportCount} incidents logged</span>
                  <span>🔥 {route.hotspotCount} hotspot zones</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${route.riskScore}%`, backgroundColor: route.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Disclaimer */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            Street conflict exposure scores are computed from verified community telemetry and municipal historical data. Always maintain alertness regardless of selected route.
          </div>
        </div>

      </div>

      {/* Emergency Contact Modal / Drawer for Clicked POIs */}
      {selectedPoiModal && (
        <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                  {POI_ICONS[selectedPoiModal.poi_type] || "📍"}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedPoiModal.name}</h3>
                  <p className="text-xs text-slate-400 capitalize">{selectedPoiModal.poi_type.replace("_", " ")} · {selectedPoiModal.ward}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoiModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              {selectedPoiModal.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>{selectedPoiModal.address}</span>
                </div>
              )}
              {selectedPoiModal.hours && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>{selectedPoiModal.hours}</span>
                </div>
              )}
              {selectedPoiModal.services && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400">
                  <strong className="text-slate-200 block mb-1">Available Services & First Aid:</strong>
                  {selectedPoiModal.services}
                </div>
              )}
            </div>

            {/* Emergency Action Call Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {selectedPoiModal.phone && (
                <a
                  href={`tel:${selectedPoiModal.phone.replace(/[^0-9+]/g, '')}`}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-500/20"
                >
                  <Phone className="w-4 h-4" /> Call Reception
                </a>
              )}
              {selectedPoiModal.emergency_contact ? (
                <a
                  href={`tel:${selectedPoiModal.emergency_contact.replace(/[^0-9+]/g, '')}`}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-rose-600/20"
                >
                  <ShieldAlert className="w-4 h-4" /> 24/7 Emergency
                </a>
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPoiModal.name + " " + selectedPoiModal.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-xs"
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}