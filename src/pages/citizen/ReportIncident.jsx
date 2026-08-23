import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportsService } from "@/api/services";
import { ChevronLeft, ChevronRight, MapPin, Camera, Check, Info, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";
import CameraVisionModal from "@/components/CameraVisionModal";
import VoiceReportInput from "@/components/VoiceReportInput";
import { DoggoSitting } from "@/components/DoggoIllustrations";
import { saveReportOffline } from "@/lib/offlineSync";

const CATEGORIES = [
  { value: "sighting", label: "Dog Sighting", desc: "Dogs present but no interaction" },
  { value: "approach_followed", label: "Approached / Followed", desc: "Dogs approached or followed me" },
  { value: "chase", label: "Chase", desc: "Dogs chased me aggressively" },
  { value: "aggressive_interaction", label: "Aggressive Interaction", desc: "Growling, snapping, lunging" },
  { value: "contact_bite", label: "Contact / Bite", desc: "Physical contact or bite occurred" },
  { value: "injured_animal", label: "Injured / Distressed Animal", desc: "Dog appears hurt or in distress" },
  { value: "other", label: "Other", desc: "Other conflict-related observation" },
];

const SEVERITY_DESC = [
  null,
  { level: "L1", label: "Sighting", desc: "Dogs present in area, no direct interaction", color: "bg-zinc-100 border-zinc-300 text-zinc-800" },
  { level: "L2", label: "Approach / Followed", desc: "Dog(s) approached or followed — felt uncomfortable", color: "bg-amber-50 border-amber-300 text-amber-900" },
  { level: "L3", label: "Chase", desc: "Dog(s) actively chased me — had to retreat or run", color: "bg-orange-50 border-orange-300 text-orange-900" },
  { level: "L4", label: "Aggressive Interaction", desc: "Dog(s) growled, snapped, or lunged — no contact", color: "bg-rose-50 border-rose-300 text-rose-900" },
  { level: "L5", label: "Contact / Bite", desc: "Physical contact or bite occurred — seek medical treatment", color: "bg-rose-100 border-rose-400 text-rose-950" },
];

const CONTEXT_OPTIONS = [
  { value: "group_presence", label: "Group of dogs" },
  { value: "near_waste", label: "Near waste / garbage" },
  { value: "near_road", label: "Near major road" },
  { value: "near_school", label: "Near school / institution" },
  { value: "near_park", label: "Near park / open space" },
  { value: "morning", label: "Morning (5–11 AM)" },
  { value: "afternoon", label: "Afternoon (11 AM–5 PM)" },
  { value: "evening", label: "Evening (5–9 PM)" },
  { value: "night", label: "Night (9 PM–5 AM)" },
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
  const [cameraModalMode, setCameraModalMode] = useState("camera");
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

    const reportData = {
      ...form,
      incident_timestamp: new Date(form.incident_timestamp).toISOString(),
      group_detected: form.context_tags.includes("group_presence") || (cvResult?.group_detected ?? false),
      cv_dog_count: cvResult?.dog_count ?? null,
      cv_confidence: cvResult ? cvResult.confidence / 100 : null,
      cv_group_detected: cvResult?.group_detected ?? null,
      cv_status: cvResult ? "processed" : "no_image",
      status: "under_review",
      verification_status: "pending",
      is_demo: true,
      trust_weight: 0.7,
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const savedOffline = saveReportOffline(reportData);
      setSubmitted({ ...reportData, id: savedOffline?.offline_id || `offline-${Date.now()}`, is_offline: true });
      setSubmitting(false);
      return;
    }

    try {
      const created = await reportsService.create(reportData);
      setSubmitted(created);
    } catch (e) {
      console.warn("Network issue encountered, saving report offline:", e);
      const savedOffline = saveReportOffline(reportData);
      setSubmitted({ ...reportData, id: savedOffline?.offline_id || `offline-${Date.now()}`, is_offline: true });
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[100dvh] bg-zinc-50 flex flex-col">
        <div className="bg-[#1a2744] px-5 pt-10 pb-6 text-white text-center">
          <DoggoSitting size={100} className="mx-auto mb-2" />
          <h1 className="font-extrabold text-xl">Report Submitted Successfully</h1>
        </div>

        <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7" />
            </div>
            <div className="font-bold text-emerald-900 text-base mb-1">Observation Telemetry Queued</div>
            <div className="text-emerald-700 text-xs leading-relaxed">Your report has been submitted to authority moderation.</div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Report ID</span>
              <span className="text-zinc-800 font-bold">{submitted.id?.slice(0, 12).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Status</span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Under Review</span>
            </div>
            <div className="flex justify-between font-sans text-xs">
              <span className="text-zinc-400">Location</span>
              <span className="text-zinc-800 font-semibold">{form.location_label}</span>
            </div>
          </div>

          {form.severity_level === 5 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <div className="font-bold text-rose-950 text-sm mb-1">⚠️ Bite Incident Recorded</div>
              <div className="text-rose-700 text-xs leading-relaxed">Visit an ARV (Anti-Rabies Vaccine) clinic immediately. Do not delay medical assistance.</div>
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#1a2744] text-white py-3.5 rounded-xl font-bold text-sm btn-press shadow-md"
          >
            Back to Citizen Portal
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
    <div className="min-h-[100dvh] bg-zinc-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1a2744] px-5 pt-8 pb-5 text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
              className="p-2 rounded-full bg-white/10 text-white btn-press"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-bold text-lg text-white">Report Incident</h1>
              <div className="text-emerald-400 text-xs font-mono">Step {step} of {TOTAL_STEPS}</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${i < step ? "bg-emerald-400" : "bg-white/15"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        {/* Step 1: Category */}
        {step === 1 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <h2 className="font-bold text-zinc-900 text-xl mb-1">What happened?</h2>
              <p className="text-zinc-500 text-xs">Speak your report or select the interaction type below.</p>
            </div>

            <VoiceReportInput
              onStructuredVoiceResult={(parsed) => {
                setForm((prev) => ({
                  ...prev,
                  category: parsed.category,
                  severity_level: parsed.severityLevel,
                  dog_count: parsed.dogCount,
                  description: parsed.transcript,
                  context_tags: parsed.context_tags || [],
                }));
              }}
            />

            <div className="space-y-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all btn-press ${form.category === cat.value ? "border-emerald-500 bg-emerald-50/50 shadow-sm" : "border-zinc-200/80 bg-white hover:border-zinc-300"}`}
                >
                  <div>
                    <div className="font-semibold text-sm text-zinc-900">{cat.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{cat.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Severity */}
        {step === 2 && (
          <div className="animate-fade-in space-y-3">
            <div>
              <h2 className="font-bold text-zinc-900 text-xl mb-1">Severity Level</h2>
              <p className="text-zinc-500 text-xs mb-2">Severity describes the <strong>interaction outcome</strong>, not the animal's intent.</p>
            </div>

            <div className="space-y-2">
              {SEVERITY_DESC.slice(1).map((s, i) => (
                <button
                  key={i + 1}
                  onClick={() => setForm(f => ({ ...f, severity_level: i + 1 }))}
                  className={`w-full text-left p-4 rounded-2xl border transition-all btn-press ${form.severity_level === i + 1 ? `${s.color} border-current shadow-sm` : `bg-white border-zinc-200 hover:border-zinc-300`}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs font-mono">{s.level}</span>
                    <span className="font-semibold text-sm">{s.label}</span>
                  </div>
                  <div className="text-xs opacity-85 leading-relaxed">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="animate-fade-in space-y-3">
            <div>
              <h2 className="font-bold text-zinc-900 text-xl mb-1">Location Telemetry</h2>
              <p className="text-zinc-500 text-xs">Select your sector or pin via GPS.</p>
            </div>

            <div className="space-y-2">
              {LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => handleLocationSelect(loc)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all btn-press ${form.location_label === loc ? "border-emerald-500 bg-emerald-50/50" : "border-zinc-200/80 bg-white hover:border-zinc-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-4 h-4 ${form.location_label === loc ? "text-emerald-600" : "text-zinc-400"}`} />
                    <span className="font-semibold text-sm text-zinc-800">{loc}</span>
                  </div>
                  {form.location_label === loc && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleLocationSelect("Sector 62 Noida")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-dashed border-emerald-300 text-emerald-700 font-semibold text-xs bg-emerald-50/30 btn-press"
            >
              <MapPin className="w-4 h-4" /> Use Current GPS Coordinates
            </button>
          </div>
        )}

        {/* Step 4: Timestamp */}
        {step === 4 && (
          <div className="animate-fade-in space-y-3">
            <div>
              <h2 className="font-bold text-zinc-900 text-xl mb-1">Timestamp</h2>
              <p className="text-zinc-500 text-xs">Defaults to current time. Adjust if historical.</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 p-4">
              <label className="block text-xs font-semibold text-zinc-700 mb-2">Incident Date & Time</label>
              <input
                type="datetime-local"
                value={form.incident_timestamp}
                onChange={e => setForm(f => ({ ...f, incident_timestamp: e.target.value }))}
                className="w-full border border-zinc-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* Step 5: Evidence */}
        {step === 5 && (
          <div className="animate-fade-in space-y-4">
            <div>
              <h2 className="font-bold text-zinc-900 text-xl mb-1">Visual Evidence & AI Vision</h2>
              <p className="text-zinc-500 text-xs">Capture photo or upload file for AI pack detection.</p>
            </div>

            {!form.evidence_url ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-zinc-300 p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-zinc-900 font-bold text-sm">Capture Photo or Upload Gallery Media</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Supports camera, photo, or video file storage</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCameraModalMode("camera");
                      setShowCameraModal(true);
                    }}
                    className="flex-1 bg-[#1a2744] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 btn-press"
                  >
                    <Camera className="w-4 h-4" /> Live Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraModalMode("upload");
                      setShowCameraModal(true);
                    }}
                    className="flex-1 bg-zinc-100 text-zinc-700 py-3 rounded-xl font-semibold text-xs hover:bg-zinc-200 transition-colors btn-press"
                  >
                    Upload Gallery File
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-zinc-900">
                  <img src={form.evidence_url} alt="Evidence" className="w-full h-44 object-cover" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Observation Notes (optional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Additional details..."
                rows={3}
                className="w-full border border-zinc-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>

            <CameraVisionModal
              isOpen={showCameraModal}
              initialMode={cameraModalMode}
              onClose={() => setShowCameraModal(false)}
              onCaptureComplete={handleAiCaptureComplete}
            />
          </div>
        )}

        {/* Step 6: Context */}
        {step === 6 && (
          <div className="animate-fade-in space-y-3">
            <div>
              <h2 className="font-bold text-zinc-900 text-xl mb-1">Contextual Telemetry</h2>
              <p className="text-zinc-500 text-xs">Select environmental tags.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CONTEXT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => toggleContext(opt.value)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all btn-press ${form.context_tags.includes(opt.value) ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-zinc-200/80 bg-white text-zinc-700"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {step === 7 && (
          <div className="animate-fade-in space-y-3">
            <div>
              <h2 className="font-bold text-zinc-900 text-xl mb-1">Final Review</h2>
              <p className="text-zinc-500 text-xs">Verify report details before submission.</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 text-xs">
              {[
                ["Category", CATEGORIES.find(c => c.value === form.category)?.label || "—"],
                ["Severity Level", `L${form.severity_level}`],
                ["Location", form.location_label || "—"],
                ["Timestamp", new Date(form.incident_timestamp).toLocaleString("en-IN")],
                ["Media Evidence", form.evidence_url ? "✓ Captured" : "None"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between p-3.5">
                  <span className="text-zinc-400 font-medium">{k}</span>
                  <span className="text-zinc-900 font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      {step < TOTAL_STEPS && step > 1 && (
        <div className="max-w-lg mx-auto w-full px-4 pb-6">
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="w-full bg-[#1a2744] text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 btn-press disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 7 && (
        <div className="max-w-lg mx-auto w-full px-4 pb-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 btn-press shadow-md shadow-emerald-600/20 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Incident Report"}
          </button>
        </div>
      )}
    </div>
  );
}