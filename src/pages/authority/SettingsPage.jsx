import { useState } from "react";
import { 
  Building, 
  Users, 
  Bell, 
  ShieldAlert, 
  Download, 
  Key, 
  Save, 
  Plus, 
  Check, 
  Trash2, 
  Mail, 
  Phone, 
  Sliders, 
  RefreshCw,
  Server
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  // General state
  const [generalConfig, setGeneralConfig] = useState({
    municipalityName: "Noida Municipal Corporation",
    departmentName: "Animal Conflict Control & Rabies Prevention Division",
    emergencyHotline: "+91 120 242 5000",
    primaryEmail: "control-room@noida.gov.in",
    defaultJurisdiction: "Sector 62 Zone Pilot",
    autoEscalateBites: true,
    requirePhotoVerification: true
  });

  // Team state
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "Dr. Rajesh Sharma", email: "r.sharma@noida.gov.in", role: "Super Admin", ward: "All Wards", status: "Active" },
    { id: 2, name: "Priya Verma", email: "p.verma@noida.gov.in", role: "Field Dispatcher", ward: "Sector 62", status: "Active" },
    { id: 3, name: "Amit Kumar", email: "a.kumar@noida.gov.in", role: "Vet Coordinator", ward: "Sector 18 & 37", status: "Active" },
    { id: 4, name: "Suresh Singh", email: "s.singh@noida.gov.in", role: "Field Officer", ward: "Sector 50 & 93", status: "On Leave" }
  ]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "Field Officer", ward: "Sector 62" });

  // Notification & Escalation state
  const [escalationConfig, setEscalationConfig] = useState({
    biteThreshold24h: 2,
    packAggressionThreshold: 3,
    citizenAlertRadiusKm: 1.5,
    enableSmsAlerts: true,
    enableEmailBroadcast: true,
    autoDispatchHighRisk: true
  });

  // Data Export & System state
  const [retentionDays, setRetentionDays] = useState(365);
  const [exportFormat, setExportFormat] = useState("geojson");

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      toast.error("Please enter a name and email address.");
      return;
    }
    const member = {
      id: Date.now(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      ward: newMember.ward,
      status: "Active"
    };
    setTeamMembers([...teamMembers, member]);
    setNewMember({ name: "", email: "", role: "Field Officer", ward: "Sector 62" });
    setShowAddMember(false);
    toast.success(`${member.name} added to team.`);
  };

  const handleRemoveMember = (id) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.info("Team member removed.");
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Authority Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure municipal parameters, team roles, escalation rules, and data exports.</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm self-start md:self-auto"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-sm font-medium">
        {[
          { id: "general", label: "General & Organization", icon: Building },
          { id: "team", label: "Team & Role Access", icon: Users },
          { id: "escalation", label: "Escalation & Alerts", icon: ShieldAlert },
          { id: "data", label: "Data Export & Retention", icon: Download },
          { id: "system", label: "System & API Integration", icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "border-blue-900 text-blue-900 bg-blue-50/50 rounded-t-lg"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: General & Organization */}
      {activeTab === "general" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-900" /> Organization Profile & Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Municipality / Authority Name</label>
              <input
                type="text"
                value={generalConfig.municipalityName}
                onChange={(e) => setGeneralConfig({ ...generalConfig, municipalityName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department / Division Name</label>
              <input
                type="text"
                value={generalConfig.departmentName}
                onChange={(e) => setGeneralConfig({ ...generalConfig, departmentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Dispatch Hotline</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={generalConfig.emergencyHotline}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, emergencyHotline: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Control Room Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={generalConfig.primaryEmail}
                  onChange={(e) => setGeneralConfig({ ...generalConfig, primaryEmail: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <h3 className="text-md font-semibold text-slate-800">Automated Dispatch Defaults</h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={generalConfig.autoEscalateBites}
                onChange={(e) => setGeneralConfig({ ...generalConfig, autoEscalateBites: e.target.checked })}
                className="mt-1 rounded text-blue-900 focus:ring-blue-900 w-4 h-4"
              />
              <div>
                <span className="text-sm font-medium text-slate-800">Auto-Escalate Severity 5 Bite Reports</span>
                <p className="text-xs text-slate-500">Automatically flag reported bite incidents as Critical Risk in verification queue.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={generalConfig.requirePhotoVerification}
                onChange={(e) => setGeneralConfig({ ...generalConfig, requirePhotoVerification: e.target.checked })}
                className="mt-1 rounded text-blue-900 focus:ring-blue-900 w-4 h-4"
              />
              <div>
                <span className="text-sm font-medium text-slate-800">Require Photo Verification for High-Risk Badging</span>
                <p className="text-xs text-slate-500">Ensures field dispatchers review attached media before marking a hotspot active.</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: Team & Role Access */}
      {activeTab === "team" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-900" /> Municipal Staff & Dispatchers
              </h2>
              <p className="text-xs text-slate-500 mt-1">Manage personnel with access to Pawlytics Authority Dashboard.</p>
            </div>
            <button
              onClick={() => setShowAddMember(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Team Member
            </button>
          </div>

          {/* Add Member Form / Modal */}
          {showAddMember && (
            <form onSubmit={handleAddMember} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Add New Team Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  required
                />
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Field Dispatcher">Field Dispatcher</option>
                  <option value="Vet Coordinator">Vet Coordinator</option>
                  <option value="Field Officer">Field Officer</option>
                </select>
                <select
                  value={newMember.ward}
                  onChange={(e) => setNewMember({ ...newMember, ward: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="All Wards">All Wards</option>
                  <option value="Sector 62">Sector 62</option>
                  <option value="Sector 18 & 37">Sector 18 & 37</option>
                  <option value="Sector 50 & 93">Sector 50 & 93</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
                >
                  Save Member
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="pb-3 pl-2">Name & Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Assigned Ward</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80">
                    <td className="py-3 pl-2">
                      <div className="font-medium text-slate-800">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.email}</div>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{member.ward}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        member.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Escalation & Alerts */}
      {activeTab === "escalation" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-900" /> Thresholds & Incident Escalation Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-slate-200 rounded-xl space-y-3">
              <label className="block text-sm font-semibold text-slate-800">
                Critical Bite Threshold (24-Hour Window)
              </label>
              <p className="text-xs text-slate-500">Number of verified bite incidents in a ward before triggering an immediate high-risk lockdown warning.</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={escalationConfig.biteThreshold24h}
                  onChange={(e) => setEscalationConfig({ ...escalationConfig, biteThreshold24h: parseInt(e.target.value) })}
                  className="w-full accent-blue-900"
                />
                <span className="text-sm font-bold text-blue-900 w-8 text-center bg-blue-50 py-1 rounded border border-blue-200">
                  {escalationConfig.biteThreshold24h}
                </span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl space-y-3">
              <label className="block text-sm font-semibold text-slate-800">
                Citizen Alert Radius
              </label>
              <p className="text-xs text-slate-500">Radius around a reported critical incident where registered citizens receive safety push notifications.</p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={escalationConfig.citizenAlertRadiusKm}
                  onChange={(e) => setEscalationConfig({ ...escalationConfig, citizenAlertRadiusKm: parseFloat(e.target.value) })}
                  className="w-full accent-blue-900"
                />
                <span className="text-sm font-bold text-blue-900 w-12 text-center bg-blue-50 py-1 rounded border border-blue-200">
                  {escalationConfig.citizenAlertRadiusKm} km
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <h3 className="text-md font-semibold text-slate-800">Broadcast Channels</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
              <div>
                <span className="text-sm font-semibold text-slate-800">SMS Gateway Alerts</span>
                <p className="text-xs text-slate-500">Dispatch SMS alerts to registered ward resident welfare associations (RWAs).</p>
              </div>
              <input
                type="checkbox"
                checked={escalationConfig.enableSmsAlerts}
                onChange={(e) => setEscalationConfig({ ...escalationConfig, enableSmsAlerts: e.target.checked })}
                className="rounded text-blue-900 focus:ring-blue-900 w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
              <div>
                <span className="text-sm font-semibold text-slate-800">Email Digest Broadcast</span>
                <p className="text-xs text-slate-500">Send daily morning conflict digests to municipal police & animal welfare leads.</p>
              </div>
              <input
                type="checkbox"
                checked={escalationConfig.enableEmailBroadcast}
                onChange={(e) => setEscalationConfig({ ...escalationConfig, enableEmailBroadcast: e.target.checked })}
                className="rounded text-blue-900 focus:ring-blue-900 w-5 h-5"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Data Export & Retention */}
      {activeTab === "data" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-900" /> Data Retention & Official Exporting
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Incident Record Retention Period</label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 outline-none"
              >
                <option value={180}>6 Months (180 Days)</option>
                <option value={365}>1 Year (365 Days)</option>
                <option value={730}>2 Years (730 Days)</option>
                <option value={1095}>3 Years (1095 Days)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1.5">Historical records older than retention period are archived to cold storage.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 outline-none"
              >
                <option value="geojson">GeoJSON (GIS Mapping compatible)</option>
                <option value="csv">CSV (Spreadsheet & Analytics)</option>
                <option value="pdf">Official PDF Audit Report</option>
              </select>
              <p className="text-xs text-slate-500 mt-1.5">Applies to all manual exports triggered from the Reports & Hotspots views.</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-800 text-sm">Download Complete Ward Risk Dataset</div>
              <div className="text-xs text-slate-500 mt-0.5">Includes verified incident points, severity scores, and ward boundaries.</div>
            </div>
            <button
              onClick={() => toast.success(`Exporting full dataset in ${exportFormat.toUpperCase()} format...`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> Export Dataset ({exportFormat.toUpperCase()})
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: System & API Integration */}
      {activeTab === "system" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-900" /> Platform Infrastructure & Integration Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Backend Platform</span>
                <div className="text-md font-bold text-slate-800 mt-0.5">Supabase Backend Cloud</div>
                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected & Active
                </div>
              </div>
              <button
                onClick={() => toast.info("Supabase connection verified cleanly.")}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MCP Agent Server</span>
                <div className="text-md font-bold text-slate-800 mt-0.5">Pawlytics MCP Server</div>
                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active (Consent Path: /oauth/consent)
                </div>
              </div>
              <button
                onClick={() => toast.info("MCP server ping successful.")}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
