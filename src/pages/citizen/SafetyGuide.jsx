import { Shield, AlertTriangle, Info, Heart, MapPin } from "lucide-react";

const SECTIONS = [
  {
    title: "What Pawlytics DOES",
    icon: Shield,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    items: [
      "Maps conflict signals reported by citizens",
      "Identifies spatial hotspots from verified reports",
      "Estimates contextual risk at ward / locality level",
      "Helps citizens make informed route decisions",
      "Helps authorities prioritize field interventions",
      "Creates an auditable record of reported incidents",
    ],
  },
  {
    title: "What Pawlytics DOES NOT DO",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    items: [
      "Identify individual dogs",
      "Declare any animal 'dangerous' or 'aggressive'",
      "Infer aggression from a single photograph",
      "Predict individual future attacks",
      "Conduct animal or person surveillance",
      "Automatically dispatch enforcement or removal",
      "Replace veterinary, medical, or authority judgment",
    ],
  },
];

const SAFETY_SECTIONS = [
  {
    title: "If dogs are nearby",
    tips: [
      "Stay calm. Avoid sudden movements or loud noises.",
      "Do not run — this can trigger a chase response.",
      "Avoid direct prolonged eye contact.",
      "Give the dogs space and change your route if possible.",
      "Carry an umbrella or bag as a barrier.",
    ],
  },
  {
    title: "If followed or chased",
    tips: [
      "Stop, stand still, fold your arms across your chest.",
      "Avoid screaming or flailing — stay composed.",
      "Back away slowly once the dog loses interest.",
      "Enter a nearby shop, vehicle, or safe structure.",
      "Alert others nearby for safety.",
    ],
  },
  {
    title: "If bitten or contacted",
    tips: [
      "Wash the wound immediately with soap and water for 15 minutes.",
      "Visit an ARV (Anti-Rabies Vaccine) facility immediately.",
      "Do not delay treatment — early vaccination is critical.",
      "Report the incident through Pawlytics to help others.",
      "Note the time and location for medical documentation.",
    ],
  },
];

export default function SafetyGuide() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1a2744] px-4 pt-10 pb-5 text-white">
        <div className="font-bold text-xl font-display mb-1">Our Approach</div>
        <div className="text-blue-300 text-sm">Ethics, transparency, and safety guidance</div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Ethics disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-800 text-sm mb-1">Safety Guidance — Not Medical Advice</div>
            <div className="text-amber-700 text-sm">The information below is general public safety guidance. For medical emergencies or bites, always consult a doctor immediately.</div>
          </div>
        </div>

        {/* What we do/don't */}
        {SECTIONS.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={i} className={`rounded-2xl border p-4 ${section.bg}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${section.color}`} />
                <div className={`font-bold text-sm ${section.color}`}>{section.title}</div>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className={`font-bold mt-0.5 flex-shrink-0 ${i === 0 ? "text-blue-600" : "text-red-500"}`}>{i === 0 ? "✓" : "✗"}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Safety sections */}
        {SAFETY_SECTIONS.map((section, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              {section.title}
            </div>
            <ul className="space-y-2">
              {section.tips.map((tip, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{j + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Privacy note */}
        <div className="bg-slate-800 rounded-2xl p-4 text-white">
          <div className="font-semibold mb-2 text-sm">Privacy Commitment</div>
          <div className="text-slate-300 text-xs leading-relaxed">
            Pawlytics focuses on conflict locations and patterns — not identifying individuals or animals.
            Reporter identity is never shown on the public map. Image EXIF location data is stripped on upload.
            Aggregated risk data and anonymized hotspot information are displayed to the public.
            Authority users access detailed report information only under their verified role.
          </div>
        </div>

        {/* ARV locator */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            <div className="font-semibold text-purple-800 text-sm">Nearest ARV Facilities (Demo Data)</div>
          </div>
          {[
            { name: "Felix Hospital — Sector 73", location: "Sector 62 Noida" },
            { name: "Metro Hospital — Sector 11", location: "Sector 12 Noida" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-purple-700 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-medium">{f.name}</span>
              <span className="text-purple-400">— {f.location}</span>
            </div>
          ))}
          <div className="mt-2 text-xs text-purple-500">Demo data — verify hours and availability directly with facilities</div>
        </div>

        <div className="text-center text-xs text-slate-400 pb-4">
          Pawlytics v1.0 — SIH 2026 MVP
          <br />We do not map dogs. We map risk.
        </div>
      </div>
    </div>
  );
}