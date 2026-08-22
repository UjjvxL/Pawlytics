/**
 * Pawlytics Municipal Animal Birth Control (ABC) & ARV Vaccination Campaign Manager
 * Supreme Court ABC Mandate Compliance & Field Ear-Notch Tagging Ledger
 */

import { useState } from "react";
import { ShieldCheck, Syringe, Scissors, MapPin, Plus, CheckCircle2, Calendar, AlertCircle } from "lucide-react";

const INITIAL_ABC_RECORDS = [
  {
    id: "ABC-8041",
    tagNumber: "NOIDA-62-041",
    sector: "Sector 62 IT Corridor",
    gender: "Female",
    sterilizationDate: "2026-07-14",
    vaccinationDate: "2026-07-14",
    arvBoosterDue: "2027-07-14",
    earNotchStatus: "Left V-Notch Verified",
    status: "Released in Sector 62",
    vetName: "Dr. A. K. Sharma (Noida Vet Center)",
  },
  {
    id: "ABC-8042",
    tagNumber: "NOIDA-18-012",
    sector: "Sector 18 Atta Market",
    gender: "Male",
    sterilizationDate: "2026-08-02",
    vaccinationDate: "2026-08-02",
    arvBoosterDue: "2027-08-02",
    earNotchStatus: "Right V-Notch Verified",
    status: "Released in Sector 18",
    vetName: "Dr. P. Verma (District Vet Clinic)",
  },
  {
    id: "ABC-8043",
    tagNumber: "NOIDA-37-088",
    sector: "Sector 37 Metro Station",
    gender: "Female",
    sterilizationDate: "2026-08-18",
    vaccinationDate: "2026-08-18",
    arvBoosterDue: "2027-08-18",
    earNotchStatus: "Left V-Notch Verified",
    status: "Post-Op Care Facility",
    vetName: "Dr. A. K. Sharma (Noida Vet Center)",
  },
];

export default function AbcCampaigns() {
  const [records, setRecords] = useState(INITIAL_ABC_RECORDS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    tagNumber: "",
    sector: "Sector 62 IT Corridor",
    gender: "Female",
    vetName: "Dr. A. K. Sharma (Noida Vet Center)",
    status: "Released in Sector 62",
  });

  const handleCreateRecord = (e) => {
    e.preventDefault();
    const newRecord = {
      id: `ABC-${Math.floor(8000 + Math.random() * 1000)}`,
      tagNumber: formData.tagNumber || `NOIDA-62-${Math.floor(100 + Math.random() * 900)}`,
      sector: formData.sector,
      gender: formData.gender,
      sterilizationDate: new Date().toISOString().split("T")[0],
      vaccinationDate: new Date().toISOString().split("T")[0],
      arvBoosterDue: "2027-08-23",
      earNotchStatus: "V-Notch Verified",
      status: formData.status,
      vetName: formData.vetName,
    };
    setRecords([newRecord, ...records]);
    setShowAddModal(false);
  };

  const totalSterilized = records.length;
  const releasedCount = records.filter((r) => r.status.startsWith("Released")).length;
  const postOpCount = records.filter((r) => r.status.includes("Post-Op")).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-7 h-7 text-blue-600" />
            ABC Sterilization & ARV Vaccination Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Supreme Court Mandate (Nov 7, 2025) Humane Catch-Neuter-Vaccinate-Release Ledger
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log ABC Field Tag
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sterilized</div>
              <div className="text-2xl font-bold text-slate-800">{totalSterilized} Canines</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">100% ARV Vaccinated</div>
              <div className="text-2xl font-bold text-slate-800">{totalSterilized} Doses Given</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Humane Release Rate</div>
              <div className="text-2xl font-bold text-slate-800">{Math.round((releasedCount / totalSterilized) * 100)}% Released</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Records Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-base">Field Ear-Notch & Tagging Ledger</h2>
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            Supreme Court ABC Rules Compliant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Tag ID / Ear-Notch</th>
                <th className="px-6 py-3.5">Sector Location</th>
                <th className="px-6 py-3.5">Sterilization & ARV Date</th>
                <th className="px-6 py-3.5">ARV Booster Due</th>
                <th className="px-6 py-3.5">Supervising Veterinary Officer</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="font-bold text-blue-900">{rec.tagNumber}</div>
                    <div className="text-xs text-slate-500 font-mono">{rec.id} · {rec.earNotchStatus}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {rec.sector}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600">
                    <div>Sterilized: {rec.sterilizationDate}</div>
                    <div className="text-emerald-700 font-semibold">ARV Dose: {rec.vaccinationDate}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {rec.arvBoosterDue}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium">{rec.vetName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                      rec.status.startsWith("Released") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-blue-600" /> Log New ABC Field Ear-Notch Tag
            </h3>
            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Tag Identifier Number</label>
                <input
                  type="text"
                  placeholder="e.g. NOIDA-62-099"
                  value={formData.tagNumber}
                  onChange={(e) => setFormData({ ...formData, tagNumber: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-blue-600 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Catch & Release Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="Sector 62 IT Corridor">Sector 62 IT Corridor</option>
                  <option value="Sector 18 Atta Market">Sector 18 Atta Market</option>
                  <option value="Sector 37 Metro Station">Sector 37 Metro Station</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Gender & V-Notch</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="Female">Female (Left V-Ear Notch)</option>
                  <option value="Male">Male (Right V-Ear Notch)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md shadow-blue-500/20"
                >
                  Save ABC Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
