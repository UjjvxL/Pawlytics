import { Layers, CheckCircle, Clock, AlertTriangle, ExternalLink } from "lucide-react";

const LAYERS = [
  {
    category: "Active — Pilot Data",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    items: [
      { name: "OSM Roads", desc: "OpenStreetMap road network for Bengaluru pilot area", status: "active" },
      { name: "Schools (Pilot)", desc: "Selected schools in the Koramangala pilot zone", status: "active" },
      { name: "Hospitals & ARV Facilities", desc: "Known hospitals and anti-rabies vaccine facilities", status: "active" },
      { name: "Parks & Open Spaces", desc: "Public parks and open spaces in pilot zone", status: "active" },
      { name: "Waste Sites", desc: "Known garbage transfer stations and dump yards", status: "active" },
      { name: "Citizen Reports", desc: "Verified and pending citizen conflict reports", status: "active" },
      { name: "Hotspot Zones", desc: "Spatial clusters from verified reports (DBSCAN-equivalent)", status: "active" },
      { name: "Risk Zones (Ward Level)", desc: "Composite risk score per ward/sector", status: "active" },
      { name: "Pilot Feeding Zones", desc: "Registered community feeding sites in pilot area", status: "active" },
    ],
  },
  {
    category: "Planned — Phase 2",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    items: [
      { name: "ABC Sterilization Coverage", desc: "Animal Birth Control sterilization coverage by ward", status: "planned", note: "Requires BBMP data partnership" },
      { name: "Vaccination Coverage (Rabies)", desc: "Dog vaccination coverage layer per ward", status: "planned", note: "Requires municipal health data" },
      { name: "Municipal Ward Boundaries (Full)", desc: "All 243 BBMP ward polygons with metadata", status: "planned", note: "Open data pending" },
      { name: "Full Feeding Zone Registry", desc: "City-wide registered and informal feeding locations", status: "planned", note: "Requires community data collection" },
    ],
  },
  {
    category: "Future — Requires Partnerships / MoUs",
    color: "text-slate-500",
    bg: "bg-slate-50 border-slate-200",
    items: [
      { name: "BBMP Complaint Registry Integration", desc: "Direct API ingestion from BBMP citizen portal", status: "future", note: "FUTURE — Government API required" },
      { name: "Hospital Bite Surveillance (IDSP)", desc: "Aggregate dog-bite case data from health surveillance", status: "future", note: "FUTURE — IDSP/IHIP data partnership" },
      { name: "Solid Waste Management Layer", desc: "Bin density, collection frequency, overflow data", status: "future", note: "FUTURE — SWM department integration" },
      { name: "CCTV Event Extraction", desc: "Dog detection from municipal CCTV (requires lawful MoU)", status: "future", note: "FUTURE — Requires lawful MoU, privacy review" },
      { name: "School Perimeter Monitoring", desc: "Real-time alerts for high-risk zones near schools", status: "future", note: "FUTURE — Requires school administration partnership" },
    ],
  },
];

const STATUS_ICONS = {
  active: <CheckCircle className="w-4 h-4 text-green-600" />,
  planned: <Clock className="w-4 h-4 text-amber-500" />,
  future: <AlertTriangle className="w-4 h-4 text-slate-400" />,
};

export default function DataLayers() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">Data Layers</h1>
        <p className="text-slate-500 text-sm mt-1">Configurable intelligence layers — active, planned, and future integrations</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        Future integrations are clearly marked and require data partnerships or government MoUs.
        Pawlytics does not claim live government API integration unless one is formally established.
      </div>

      {LAYERS.map((category, i) => (
        <div key={i} className={`rounded-xl border ${category.bg} p-5`}>
          <div className={`font-bold text-base mb-4 ${category.color}`}>{category.category}</div>
          <div className="space-y-3">
            {category.items.map((layer, j) => (
              <div key={j} className="flex items-start gap-3 bg-white rounded-xl p-3.5 border border-white shadow-sm">
                <div className="mt-0.5">{STATUS_ICONS[layer.status]}</div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800 text-sm">{layer.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{layer.desc}</div>
                  {layer.note && (
                    <div className="text-xs text-amber-600 mt-1 font-medium">{layer.note}</div>
                  )}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                  layer.status === "active" ? "bg-green-100 text-green-700" :
                  layer.status === "planned" ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {layer.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}