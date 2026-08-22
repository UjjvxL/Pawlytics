import { Phone, ShieldAlert, MapPin, X, ExternalLink, HeartPulse } from "lucide-react";

const ARV_FACILITIES = [
  {
    name: "District Hospital Sector 30 (Govt ARV Center)",
    address: "Block B, Sector 30, Noida, UP 201301",
    distance: "1.8 km away",
    status: "Free ARV Available 24/7",
    phone: "0120-2522176",
    isPrimary: true,
  },
  {
    name: "ESI Hospital Sector 24",
    address: "Sector 24, Noida, UP 201301",
    distance: "2.4 km away",
    status: "Free ARV (09:00 - 17:00)",
    phone: "0120-2411033",
    isPrimary: false,
  },
  {
    name: "Kailash Hospital Sector 27",
    address: "H-33, Sector 27, Noida, UP 201301",
    distance: "3.1 km away",
    status: "24/7 Emergency & RIG Immunoglobulin",
    phone: "0120-2444444",
    isPrimary: false,
  },
];

export default function ArvEmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-red-200">
        {/* Header */}
        <div className="bg-red-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg font-display">ARV & Rabies Emergency First-Aid</h2>
              <p className="text-red-100 text-xs">Post-Exposure Prophylaxis (PEP) & ARV Centers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Emergency 15-Min Protocol */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-900 text-sm">
              <HeartPulse className="w-5 h-5 text-red-600" /> Immediate 15-Minute Rabies First-Aid
            </div>
            <ol className="list-decimal list-inside text-xs text-red-800 space-y-1.5 leading-relaxed font-medium">
              <li><strong>Wash wound for 15 minutes</strong> under running tap water using soap thoroughly.</li>
              <li>Apply povidone-iodine, alcohol, or antiseptic solution to the bite area.</li>
              <li><strong>Do NOT stitch or bandage wound tightly</strong> — leave open to air.</li>
              <li><strong>Visit an ARV facility immediately</strong> for Dose 0 Anti-Rabies Vaccine & Rabies Immunoglobulin (RIG).</li>
            </ol>
          </div>

          {/* ARV Center List */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nearest Government ARV Centers</div>
            <div className="space-y-2.5">
              {ARV_FACILITIES.map((fac, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${fac.isPrimary ? 'bg-red-50/50 border-red-300' : 'bg-slate-50 border-slate-200'} flex flex-col gap-2`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{fac.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {fac.address}
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {fac.distance}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                    <span className="text-emerald-700 font-semibold">{fac.status}</span>
                    <a
                      href={`tel:${fac.phone}`}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call {fac.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>National Emergency Helpline: <strong>108 / 112</strong></span>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-xl font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
