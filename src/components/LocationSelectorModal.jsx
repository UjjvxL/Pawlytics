import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, LocateFixed, Search, X, Check, Navigation, Sparkles, Edit3 } from "lucide-react";
import { useLocationState } from "@/lib/locationContext";

export default function LocationSelectorModal({ isOpen, onClose }) {
  const {
    currentLocality,
    currentZone,
    updateLocation,
    detectGpsLocation,
    isDetectingGps,
    gpsError,
    popularLocations,
  } = useLocationState();

  const [searchQuery, setSearchQuery] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [activeTab, setActiveTab] = useState("presets"); // 'presets' | 'custom'

  if (!isOpen) return null;

  const filteredLocations = popularLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPreset = (loc) => {
    updateLocation(loc.name, loc.zone, loc.coords);
    onClose();
  };

  const handleApplyCustom = (e) => {
    e?.preventDefault();
    const nameToUse = customInput.trim() || searchQuery.trim();
    if (!nameToUse) return;
    updateLocation(nameToUse, "Custom Location");
    setSearchQuery("");
    setCustomInput("");
    onClose();
  };

  const handleGpsDetect = async () => {
    try {
      await detectGpsLocation();
      onClose();
    } catch {
      // Error handled inside hook
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2500] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative z-10 bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-5 text-white max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Top Grab Handle on mobile */}
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                <Sparkles className="w-3 h-3" /> Spatial Intelligence Bounds
              </div>
              <h2 className="text-lg font-bold text-white font-display">Choose Active Location</h2>
              <p className="text-xs text-slate-400">
                Data, risk telemetry, and safety alerts will adapt to this sector
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. GPS Auto-Detect Button */}
          <div className="space-y-2">
            <button
              onClick={handleGpsDetect}
              disabled={isDetectingGps}
              className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 active:scale-[0.99] text-white p-4 rounded-2xl font-bold text-sm flex items-center justify-between shadow-lg shadow-blue-500/20 transition-all border border-blue-400/30 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                  {isDetectingGps ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <LocateFixed className="w-5 h-5 animate-pulse" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">
                    {isDetectingGps ? "Acquiring GPS Satellite Signal..." : "Use Current GPS Location"}
                  </div>
                  <div className="text-blue-100 text-xs mt-0.5">
                    Auto-fetches coordinates & snaps to nearest ward
                  </div>
                </div>
              </div>
              <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-lg font-semibold">
                Live GPS
              </span>
            </button>

            {gpsError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                ⚠️ {gpsError} — Please enable location access or type location manually below.
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-mono uppercase tracking-wider">
              Or Choose / Type Location
            </span>
          </div>

          {/* Search & Custom Input Box */}
          <form onSubmit={handleApplyCustom} className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search sector or type custom location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-24 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Set Location
                </button>
              )}
            </div>
          </form>

          {/* List of Popular Sectors / Search Results */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[220px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              {searchQuery ? `Matching Locations (${filteredLocations.length})` : "Popular Sectors & Wards"}
            </div>

            {filteredLocations.map((loc) => {
              const isSelected = currentLocality === loc.name;
              return (
                <button
                  key={loc.name}
                  onClick={() => handleSelectPreset(loc)}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500/50 text-white font-semibold shadow-md shadow-emerald-500/5"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{loc.name}</div>
                      <div className="text-xs text-slate-400">{loc.zone}</div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">Select</span>
                  )}
                </button>
              );
            })}

            {/* Custom Location Fallback Button if search didn't match presets */}
            {searchQuery && !filteredLocations.some((l) => l.name.toLowerCase() === searchQuery.toLowerCase()) && (
              <button
                onClick={handleApplyCustom}
                className="w-full text-left p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-sm font-bold">Use "{searchQuery}"</div>
                    <div className="text-xs text-emerald-500/80">Set as custom active sector</div>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-md font-bold">
                  Apply Custom
                </span>
              </button>
            )}
          </div>

          {/* Footer Active Status */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Currently Active:</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              📍 {currentLocality} ({currentZone})
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
