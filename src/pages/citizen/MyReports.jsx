import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportsService, authService } from "@/api/services";
import { CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/riskEngine";
import { FileText, CheckCircle, Clock, XCircle, AlertTriangle, Shield, Award, Download, Bell, Sparkles, MapPin, ChevronRight, Eye, Trash2, User, Edit3 } from "lucide-react";
import { DoggoSitting } from "@/components/DoggoIllustrations";

const STATUS_CONFIG = {
  under_review: { label: "CV Under Review", icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/30", step: 1 },
  verified: { label: "Verified & Escalated", icon: CheckCircle, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", step: 3 },
  rejected: { label: "Rejected / Spam", icon: XCircle, color: "text-rose-400 bg-rose-500/10 border-rose-500/30", step: 0 },
  duplicate: { label: "Duplicate Entry", icon: AlertTriangle, color: "text-slate-400 bg-slate-500/10 border-slate-500/30", step: 0 },
};

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [alertSector, setAlertSector] = useState("Knowledge Park 2 (IILM / Galgotias)");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'verified', 'pending'

  useEffect(() => {
    setUserProfile(authService.getProfile());
    reportsService.filter({ is_demo: true })
      .then(r => {
        setReports(r.sort((a, b) => new Date(b.incident_timestamp || b.created_date) - new Date(a.incident_timestamp || a.created_date)));
        setLoading(false);
      });
  }, []);

  const downloadVerificationReceipt = (report) => {
    const receiptData = {
      title: "PAWLYTICS CITIZEN TELEMETRY VERIFICATION RECEIPT",
      report_id: report.id || `RP-${Date.now().toString().slice(-6)}`,
      timestamp: new Date(report.incident_timestamp || report.created_date).toLocaleString("en-IN"),
      location: report.location_label || "Greater Noida Sector",
      ward: report.ward || "Knowledge Park 2",
      category: CATEGORY_LABELS[report.category] || report.category,
      severity_level: report.severity_level,
      dog_count: report.dog_count || 1,
      cv_verification_tier: report.cv_uncertainty || "CONFIRMED",
      verification_status: report.verification_status || report.status,
      digest_hash: `0x${Math.random().toString(16).slice(2, 12).toUpperCase()}`
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Pawlytics_Receipt_${receiptData.report_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredReports = reports.filter(r => {
    if (activeTab === "verified") return r.status === "verified" || r.verification_status === "verified";
    if (activeTab === "pending") return r.status === "under_review" || r.status === "pending";
    return true;
  });

  const verifiedCount = reports.filter(r => r.status === "verified" || r.verification_status === "verified").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-slate-950">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-slate-400 font-medium">Fetching citizen telemetry records...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 pb-28 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-[#1a2744] to-slate-950 px-4 pt-10 pb-6 border-b border-slate-800">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Citizen Telemetry & Impact Hub
              </div>
              <h1 className="text-xl font-bold text-white font-display tracking-tight">My Submissions & Impact</h1>
              <p className="text-xs text-slate-400">Track report verification status & RWA mitigation workflow</p>
            </div>
            <DoggoSitting className="w-12 h-12 text-emerald-400 opacity-90" />
          </div>

          {/* User Profile Card */}
          {userProfile && (
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-500/30">
                  {userProfile.name?.[0]?.toUpperCase() || "C"}
                </div>
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{userProfile.name || "Citizen Guardian"}</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                      Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {userProfile.role || "Citizen"} · {userProfile.ward || "Knowledge Park 2"}
                  </div>
                </div>
              </div>
              <Link
                to="/complete-profile"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold border border-slate-700/60"
                title="Edit Profile Details"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Edit Profile
              </Link>
            </div>
          )}

          {/* Gamified Impact Scoreboard */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 grid grid-cols-3 gap-2 text-center shadow-xl">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-lg font-bold text-white">{reports.length}</div>
              <div className="text-[10px] text-slate-400 font-medium">Reports Filed</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-lg font-bold text-emerald-400">{verifiedCount}</div>
              <div className="text-[10px] text-slate-400 font-medium">Verified Valid</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-xs font-bold text-purple-400 flex items-center justify-center gap-1 mt-1">
                <Award className="w-3.5 h-3.5" /> Lvl 2
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Guardian Rank</div>
            </div>
          </div>

          {/* Home Sector Notification Preference */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-slate-300 font-semibold block">Home Sector Alerts</span>
                <span className="text-slate-500 text-[11px]">{alertSector}</span>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${notificationsEnabled ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}
            >
              {notificationsEnabled ? "Active" : "Muted"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content List */}
      <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">
        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "all" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-slate-200"}`}
          >
            All Submissions ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "verified" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"}`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "pending" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-slate-200"}`}
          >
            Under Review
          </button>
        </div>

        {/* Report Cards */}
        {filteredReports.map((report, i) => {
          const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.under_review;
          const StatusIcon = status.icon;
          const severity = SEVERITY_LABELS[report.severity_level];

          return (
            <div
              key={report.id || i}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-xl space-y-3 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base font-display">
                      {CATEGORY_LABELS[report.category] || report.category}
                    </span>
                    <span className="text-xs bg-slate-800 text-sky-400 px-2 py-0.5 rounded-md font-bold border border-slate-700">
                      🐕 {report.dog_count || 1} dogs
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{report.location_label}</span>
                    <span>·</span>
                    <span style={{ color: severity?.color }} className="font-semibold">{severity?.short}</span>
                  </div>
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${status.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
              </div>

              {report.description && (
                <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {report.description}
                </p>
              )}

              {/* Lifecycle Progress Stepper */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Resolution Lifecycle:</div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 font-semibold">
                    1. Telemetry Filed ✓
                  </div>
                  <div className={`p-1.5 rounded-lg border font-semibold ${report.cv_uncertainty === "CONFIRMED" || report.status === "verified" ? "bg-slate-950 border-emerald-500/30 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                    2. CV Verified
                  </div>
                  <div className={`p-1.5 rounded-lg border font-semibold ${report.status === "verified" ? "bg-slate-950 border-emerald-500/30 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
                    3. RWA Escalated
                  </div>
                </div>
              </div>

              {/* Metadata Footer & Download Receipt */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>📅 {new Date(report.incident_timestamp || report.created_date).toLocaleDateString("en-IN")}</span>
                  {report.cv_uncertainty && (
                    <span className="bg-slate-800 text-purple-400 px-2 py-0.5 rounded-md font-semibold border border-slate-700">
                      CV: {report.cv_uncertainty}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => downloadVerificationReceipt(report)}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" /> Receipt JSON
                </button>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-300 font-bold">No Submissions Found</div>
            <div className="text-slate-500 text-xs mt-1">Your submitted telemetry reports will appear here with live tracking</div>
          </div>
        )}
      </div>
    </div>
  );
}