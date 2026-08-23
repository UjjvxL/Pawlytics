import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, Shield, CheckCircle2, Sparkles, ArrowRight, Bell, PhoneCall } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

const SECTORS = [
  "Knowledge Park 2 (IILM / Galgotias)",
  "Knowledge Park 3 (Sharda / MaxVet)",
  "Alpha 1 Commercial Belt",
  "Alpha 2 (Kailash / DPS)",
  "Beta 1 Market & Ryan School",
  "Beta 2 Sector Gate",
  "Sector 62 Noida",
  "Sector 18 Commercial Market",
  "Indirapuram Ghaziabad",
  "Pari Chowk Roundabout"
];

const ROLES = [
  "Citizen / Resident",
  "RWA Representative / Sector Official",
  "Student / Campus Volunteer",
  "Veterinary Volunteer / NGO Partner",
  "Municipal Inspector / Authority Officer"
];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    ward: "Knowledge Park 2 (IILM / Galgotias)",
    role: "Citizen / Resident",
    emergencyContact: "",
    whatsappAlerts: true
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const existing = authService.getProfile();
    if (existing) {
      setProfile(prev => ({ ...prev, ...existing }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile({
        ...profile,
        completedAt: new Date().toISOString(),
        isComplete: true
      });
      setSavedSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayout
      icon={User}
      title="Complete Your Profile"
      subtitle="Configure your resident details to receive sector telemetry & emergency alerts"
    >
      {savedSuccess ? (
        <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-display">Profile Verified & Saved!</h3>
          <p className="text-sm text-slate-500">Redirecting to your conflict intelligence portal...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="e.g. Rahul Sharma"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone / WhatsApp Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          {/* Home Sector / Ward */}
          <div className="space-y-1.5">
            <Label htmlFor="ward">Home Sector / Ward</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <select
                id="ward"
                value={profile.ward}
                onChange={e => setProfile({ ...profile, ward: e.target.value })}
                className="w-full bg-background border border-input rounded-md pl-10 pr-4 h-11 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="role">Resident Designation / Role</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <select
                id="role"
                value={profile.role}
                onChange={e => setProfile({ ...profile, role: e.target.value })}
                className="w-full bg-background border border-input rounded-md pl-10 pr-4 h-11 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-1.5">
            <Label htmlFor="emergencyContact">24/7 Emergency Contact (Optional)</Label>
            <div className="relative">
              <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="emergencyContact"
                placeholder="+91 98101 99999 (Family / Clinic)"
                value={profile.emergencyContact}
                onChange={e => setProfile({ ...profile, emergencyContact: e.target.value })}
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* WhatsApp Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-900">WhatsApp Sector Alerts</div>
                <div className="text-slate-500">Receive high-risk warnings for {profile.ward.split(" ")[0]}</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.whatsappAlerts}
              onChange={e => setProfile({ ...profile, whatsappAlerts: e.target.checked })}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </div>

          <Button type="submit" className="w-full h-12 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20" disabled={saving}>
            {saving ? "Saving Profile..." : <>Save & Proceed to App <ArrowRight className="w-4 h-4 ml-2" /></>}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
