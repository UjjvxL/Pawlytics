import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportsService } from "@/api/services";
import { ChevronLeft, ChevronRight, MapPin, Camera, Check, Info, Sparkles, ShieldCheck } from "lucide-react";
import CameraVisionModal from "@/components/CameraVisionModal";

const CATEGORIES = [
  { value: "sighting", label: "Dog Sighting", emoji: "👁️", desc: "Dogs present but no interaction" },
  { value: "approach_followed", label: "Approached / Followed", emoji: "🚶", desc: "Dogs approached or followed me" },
  { value: "chase", label: "Chase", emoji: "🏃", desc: "Dogs chased me aggressively" },
  { value: "aggressive_interaction", label: "Aggressive Interaction", emoji: "⚠️", desc: "Growling, snapping, lunging" },
  { value: "contact_bite", label: "Contact / Bite", emoji: "🩹", desc: "Physical contact or bite occurred" },
  { value: "injured_animal", label: "Injured / Distressed Animal", emoji: "🆘", desc: "Dog appears hurt or in distress" },
  { value: "other", label: "Other", emoji: "📝", desc: "Other conflict-related observation" },
];

const SEVERITY_DESC = [
  null,
  { level: "L1", label: "Sighting", desc: "Dogs present in area, no direct interaction", color: "bg-gray-100 border-gray-300 text-gray-800" },
  { level: "L2", label: "Approach / Followed", desc: "Dog(s) approached or followed — I felt uncomfortable", color: "bg-amber-50 border-amber-300 text-amber-800" },
  { level: "L3", label: "Chase", desc: "Dog(s) actively chased me — I had to retreat or run", color: "bg-orange-50 border-orange-300 text-orange-800" },
  { level: "L4", label: "Aggressive Interaction", desc: "Dog(s) growled, snapped, or lunged — no contact", color: "bg-red-50 border-red-300 text-red-800" },
  { level: "L5", label: "Contact / Bite", desc: "Physical contact or bite occurred — please seek ARV treatment", color: "bg-red-100 border-red-400 text-red-900" },
];

const CONTEXT_OPTIONS = [
  { value: "group_presence", label: "Group of dogs", emoji: "🐕🐕" },
  { value: "near_waste", label: "Near waste / garbage", emoji: "🗑️" },
  { value: "near_road", label: "Near major road", emoji: "🛣️" },
  { value: "near_school", label: "Near school / institution", emoji: "🏫" },
  { value: "near_park", label: "Near park / open space", emoji: "🌳" },
  { value: "morning", label: "Morning (5–11 AM)", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon (11 AM–5 PM)", emoji: "☀️" },
  { value: "evening", label: "Evening (5–9 PM)", emoji: "🌆" },
  { value: "night", label: "Night (9 PM–5 AM)", emoji: "🌙" },
];

const LOCATIONS = [
  "Sector 62 Noida",
  "Sector 18 Atta Market",
  "Sector 37 Noida",
  "Sector 50 Noida",
  "Sector 93 Noida",
  "Sector 12 Noida",
];

const DEMO_COORDS = {
  "Sector 62 Noida": { lat: 28.6260, lng: 77.3620 },
  "Sector 18 Atta Market": { lat: 28.5710, lng: 77.3260 },
  "Sector 37 Noida": { lat: 28.5840, lng: 77.3540 },
  "Sector 50 Noida": { lat: 28.5730, lng: 77.3895 },
  "Sector 93 Noida": { lat: 28.4980, lng: 77.3980 },
  "Sector 12 Noida": { lat: 28.5800, lng: 77.3300 },
};

export default function ReportIncident() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [cvResult, setCvResult] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [form, setForm] = useState({
    category: "",
    severity_level: null,
    latitude: null,
    longitude: null,
    location_label: "",
    ward: "",
    incident_timestamp: new Date().toISOString().slice(0, 16),
    evidence_url: "",
    description: "",
    dog_count: 1,
    context_tags: [],
  });

  const handleAiCaptureComplete = (aiData) => {
    setCvResult({
      dog_count: aiData.cv_dog_count,
      confidence: Math.round(aiData.cv_confidence * 100),
      group_detected: aiData.cv_group_detected,
      status: "processed",
    });

    setForm((f) => {
      const updatedTags = new Set(f.context_tags);
      if (aiData.cv_group_detected) updatedTags.add("group_presence");
      return {
        ...f,
        evidence_url: aiData.evidence_url,
        dog_count: aiData.cv_dog_count,
        context_tags: Array.from(updatedTags),
        severity_level: f.severity_level || aiData.suggested_severity,
      };
    });
  };

  const TOTAL_STEPS = 7;

  const simulateCvDetection = (hasImage) => {
    if (!hasImage) return null;
    const dogCount = Math.floor(Math.random() * 5) + 1;
    const confidence = 0.70 + Math.random() * 0.27;
    return {
      dog_count: dogCount,
      confidence: Math.round(confidence * 100),
      group_detected: dogCount >= 3,
      status: confidence < 0.77 ? "low_confidence" : "processed",
    };
  };

  const handleCategorySelect = (cat) => {
    const severityMap = {
      sighting: 1, approach_followed: 2, chase: 3,
      aggressive_interaction: 4, contact_bite: 5, injured_animal: 1, other: 1,
    };
    setForm(f => ({ ...f, category: cat, severity_level: severityMap[cat] }));
    setStep(2);
  };

  const handleLocationSelect = (loc) => {
    const coords = DEMO_COORDS[loc] || DEMO_COORDS["Sector 62 Noida"];
    const jitter = () => (Math.random() - 0.5) * 0.004;
    setForm(f => ({
      ...f,
      location_label: loc,
      ward: loc,
      latitude: coords.lat + jitter(),
      longitude: coords.lng + jitter(),
    }));
  };

  const toggleContext = (tag) => {
    setForm(f => ({
      ...f,
      context_tags: f.context_tags.includes(tag)
        ? f.context_tags.filter(t => t !== tag)
        : [...f.context_tags, tag],
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const cv = simulateCvDetection(!!form.evidence_url);
    setCvResult(cv);

    const reportData = {
      ...form,
      incident_timestamp: new Date(form.incident_timestamp).toISOString(),
      group_detected: form.context_tags.includes("group_presence") || (cv?.group_detected ?? false),
      cv_dog_count: cv?.dog_count ?? null,
      cv_confidence: cv ? cv.confidence / 100 : null,
      cv_group_detected: cv?.group_detected ?? null,
      cv_status: cv ? (cv.status === "low_confidence" ? "low_confidence" : "processed") : "no_image",
      status: "under_review",
      verification_status: "pending",
      is_demo: true,
      trust_weight: 0.7,
    };

    try {
      const created = await reportsService.create(reportData);
      setSubmitted(created);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-[#1a2744] px-4 pt-10 pb-6">
          <div className="text-white font-bold text-lg font-display">Report Submitted</div>
        </div>
        <div className="flex-1 px-4 py-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div className="font-bold text-green-800 text-lg mb-1">Report Received</div>
            <div className="text-green-700 text-sm">Your observation has been submitted for review.</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Report ID</span>
              <span className="font-mono text-xs text-slate-700 font-medium">{submitted.id?.slice(0, 12).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium border border-amber-200">Under Review</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Location</span>
              <span className="text-slate-700">{form.location_label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Submitted</span>
              <span className="text-slate-700">{new Date().toLocaleTimeString("en-IN")}</span>
            </div>
          </div>

          {cvResult && (
            <div className="bg-slate-800 rounded-2xl p-4 mb-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">CV Analysis [Prototype]</div>
              <div className="text-white font-semibold mb-1">{cvResult.dog_count} dog{cvResult.dog_count > 1 ? 's' : ''} detected</div>
              <div className="text-slate-300 text-sm mb-1">Detection confidence: {cvResult.confidence}%</div>
              {cvResult.group_detected && <div className="text-amber-300 text-sm mb-1">⚠ Possible group presence</div>}
              {cvResult.status === "low_confidence" && (
                <div className="text-yellow-300 text-xs mt-2 bg-yellow-900/30 px-2 py-1.5 rounded-lg">
                  Low confidence result — flagged for human review
                </div>
              )}
              <div className="text-slate-500 text-xs mt-2">
                Architecture: Report → CV Detection → Context Tags → Verification → Risk Engine
              </div>
            </div>
          )}

          {form.severity_level === 5 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
              <div className="font-semibold text-red-800 mb-1">⚠️ Bite Reported — Seek Medical Attention</div>
              <div className="text-red-700 text-sm">Please visit an ARV (Anti-Rabies Vaccine) facility as soon as possible. Do not delay treatment.</div>
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-900 text-white py-3.5 rounded-xl font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const canProceed = () => {
    if (step === 1) return !!form.category;
    if (step === 2) return !!form.severity_level;
    if (step === 3) return !!form.location_label && form.latitude;
    if (step === 4) return !!form.incident_timestamp;
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1a2744] px-4 pt-10 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} className="p-2 rounded-full bg-white/10 text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-white font-bold font-display">Report Incident</div>
            <div className="text-blue-300 text-xs">Step {step} of {TOTAL_STEPS}</div>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i < step ? "bg-blue-400" : "bg-white/20"}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        {/* Step 1: Category */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="font-bold text-slate-800 text-xl mb-1 font-display">What happened?</h2>
            <p className="text-slate-500 text-sm mb-4">Select the type of interaction you experienced.</p>
            <div className="space-y-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${form.category === cat.value ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <div className="font-semibold text-slate-800">{cat.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{cat.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Severity */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="font-bold text-slate-800 text-xl mb-1 font-display">How serious was it?</h2>
            <p className="text-slate-500 text-sm mb-2">Severity describes the <strong>reported interaction</strong>, not the personality of an individual dog.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-4 text-xs text-blue-700 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Pawlytics does not label individual animals as "dangerous" or "aggressive."
            </div>
            <div className="space-y-2">
              {SEVERITY_DESC.slice(1).map((s, i) => (
                <button
                  key={i + 1}
                  onClick={() => setForm(f => ({ ...f, severity_level: i + 1 }))}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${form.severity_level === i + 1 ? `${s.color} border-current` : `bg-white border-slate-200 hover:border-slate-300`}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-sm font-mono">{s.level}</span>
                    <span className="font-semibold text-sm">{s.label}</span>
                  </div>
                  <div className="text-xs opacity-80">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="font-bold text-slate-800 text-xl mb-1 font-display">Where did it happen?</h2>
            <p className="text-slate-500 text-sm mb-4">Select the nearest known location or use GPS.</p>
            <div className="space-y-2 mb-4">
              {LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => handleLocationSelect(loc)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${form.location_label === loc ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <MapPin className={`w-5 h-5 flex-shrink-0 ${form.location_label === loc ? "text-blue-900" : "text-slate-400"}`} />
                  <span className="font-medium text-slate-800">{loc}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const loc = "Sector 62 Noida";
                handleLocationSelect(loc);
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-700 font-medium"
            >
              <MapPin className="w-4 h-4" /> Use Current GPS Location
            </button>
            {form.location_label && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm text-green-700 flex items-center gap-2">
                <Check className="w-4 h-4" /> Location set: {form.location_label}
              </div>
            )}
          </div>
        )}

        {/* Step 4: When */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="font-bold text-slate-800 text-xl mb-1 font-display">When did it happen?</h2>
            <p className="text-slate-500 text-sm mb-4">Defaults to now. Edit if the incident was earlier.</p>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Date & Time</label>
              <input
                type="datetime-local"
                value={form.incident_timestamp}
                onChange={e => setForm(f => ({ ...f, incident_timestamp: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
              />
            </div>
          </div>
        )}

        {/* Step 5: Evidence */}
        {step === 5 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <h2 className="font-bold text-slate-800 text-xl mb-1 font-display">Add evidence & AI Scan</h2>
              <p className="text-slate-500 text-sm mb-2">Use live camera or upload photo/video for real-time AI canine detection.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                EXIF location data is stripped. AI Vision detects canine counts & pack formations automatically.
              </div>
            </div>

            {/* Camera / Upload Action Card */}
            {!form.evidence_url ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-slate-800 font-semibold text-sm">Capture Live Photo or Upload File</div>
                  <div className="text-xs text-slate-400">Live Camera, Video, or Photo Gallery</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="flex-1 bg-blue-900 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-blue-800 transition-colors"
                  >
                    <Camera className="w-4 h-4" /> Open Camera / Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors"
                  >
                    Upload Photo / Video
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scanned Evidence</span>
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="text-xs text-blue-700 font-medium hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Rescan / Change
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img src={form.evidence_url} alt="Evidence" className="w-full h-44 object-cover" />
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AI Verified: {cvResult?.dog_count || form.dog_count} Canine(s)
                  </div>
                </div>

                {cvResult && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between">
                    <span>AI Detection Confidence: <strong>{cvResult.confidence}%</strong></span>
                    {cvResult.group_detected && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Pack Group</span>}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Briefly describe what happened..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 resize-none"
              />
            </div>

            {/* Camera Vision Modal Component */}
            <CameraVisionModal
              isOpen={showCameraModal}
              onClose={() => setShowCameraModal(false)}
              onCaptureComplete={handleAiCaptureComplete}
            />
          </div>
        )}

        {/* Step 6: Context */}
        {step === 6 && (
          <div className="animate-fade-in">
            <h2 className="font-bold text-slate-800 text-xl mb-1 font-display">Additional context</h2>
            <p className="text-slate-500 text-sm mb-4">Select all that apply. This improves risk scoring accuracy.</p>
            <div className="grid grid-cols-2 gap-2">
              {CONTEXT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => toggleContext(opt.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${form.context_tags.includes(opt.value) ? "border-blue-900 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="text-sm font-medium leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {step === 7 && (
          <div className="animate-fade-in">
            <h2 className="font-bold text-slate-800 text-xl mb-1 font-display">Review & Submit</h2>
            <p className="text-slate-500 text-sm mb-4">Confirm your report details before submitting.</p>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 mb-4">
              {[
                ["Type", CATEGORIES.find(c => c.value === form.category)?.label || "—"],
                ["Severity", `L${form.severity_level} — ${SEVERITY_DESC[form.severity_level]?.label}`],
                ["Location", form.location_label || "—"],
                ["Time", new Date(form.incident_timestamp).toLocaleString("en-IN")],
                ["Photo", form.evidence_url ? "✓ Added" : "Not added"],
                ["Context tags", form.context_tags.length > 0 ? form.context_tags.join(", ") : "None"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between px-4 py-3">
                  <span className="text-sm text-slate-500">{k}</span>
                  <span className="text-sm text-slate-800 font-medium text-right max-w-[55%]">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-3 text-xs text-slate-500 mb-4 border border-slate-200">
              Anonymous reports are welcome. Your identity is never shown on the public map. By submitting, you confirm this observation is genuine.
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {step < TOTAL_STEPS && step > 1 && (
        <div className="px-4 pb-6">
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="w-full bg-blue-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
          {step < 4 && (
            <button onClick={() => setStep(s => s + 1)} className="w-full text-center text-slate-400 text-sm mt-2">Skip this step</button>
          )}
        </div>
      )}

      {step === 7 && (
        <div className="px-4 pb-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>Submit Report</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}