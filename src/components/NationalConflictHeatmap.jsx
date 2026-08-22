import { MapPin, TrendingUp, AlertCircle, ShieldAlert } from "lucide-react";

const STATE_DATA = [
  { state: "Maharashtra", cases: "4,85,000", percentage: "13.0%", risk: "Critical", color: "bg-red-500", raw: 485000 },
  { state: "Tamil Nadu", cases: "4,80,000", percentage: "12.9%", risk: "Critical", color: "bg-red-500", raw: 480000 },
  { state: "Gujarat", cases: "3,93,000", percentage: "10.6%", risk: "High", color: "bg-orange-500", raw: 393000 },
  { state: "Karnataka", cases: "3,61,000", percentage: "9.7%", risk: "High", color: "bg-orange-500", raw: 361000 },
  { state: "Bihar", cases: "2,64,000", percentage: "7.1%", risk: "High", color: "bg-orange-500", raw: 264000 },
  { state: "Uttar Pradesh", cases: "2,55,423", percentage: "6.9%", risk: "Elevated", color: "bg-amber-500", raw: 255423 },
  { state: "Rajasthan", cases: "1,36,247", percentage: "3.7%", risk: "Elevated", color: "bg-amber-500", raw: 136247 },
  { state: "West Bengal", cases: "1,01,302", percentage: "2.7%", risk: "Moderate", color: "bg-yellow-500", raw: 101302 },
  { state: "Delhi NCR", cases: "64,127", percentage: "1.7%", risk: "Moderate", color: "bg-yellow-500", raw: 64127 },
];

export default function NationalConflictHeatmap() {
  const maxCases = 500000;

  return (
    <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 text-white shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-display text-white">National Conflict Load (IDSP / PIB 2024 Data)</h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">State-by-State Dog-Bite Case Distribution & Vulnerability Tracking</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400">National Total:</span>
            <span className="text-red-400 font-bold ml-1 text-sm">37,15,713 Cases</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-700" />
          <div>
            <span className="text-slate-400">Rabies Fatalities:</span>
            <span className="text-amber-400 font-bold ml-1 text-sm">54 Deaths</span>
          </div>
        </div>
      </div>

      {/* State Bars Grid */}
      <div className="space-y-3">
        {STATE_DATA.map((st) => (
          <div key={st.state} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 hover:bg-slate-800 transition-colors">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-white">{st.state}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${st.color} text-white`}>
                  {st.risk}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-300 font-bold">{st.cases}</span>
                <span className="text-slate-400">({st.percentage})</span>
              </div>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${st.color} transition-all duration-500 rounded-full`}
                style={{ width: `${(st.raw / maxCases) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          Data source: Integrated Disease Surveillance Programme (IDSP-IHIP) / Ministry of Fisheries & Animal Husbandry. Supreme Court of India Order (Nov 2025) mandating high-vulnerability zone identification.
        </div>
      </div>
    </div>
  );
}
