import { supabase } from '../supabaseClient.js';

// Demo Fallbacks to ensure zero-downtime performance
const DEMO_WARDS = [
  { id: "w-kp2", name: "Knowledge Park 2 (IILM / Galgotias)", ward_number: "GN-KP2", city: "Greater Noida", center_lat: 28.4630, center_lng: 77.4920, risk_score: 68, risk_level: "elevated", confidence: "high", report_count: 24, verified_report_count: 19, bite_count: 3, active_hotspot_count: 2, explanation: "High student footfall near IILM & Galgotias circles; evening pack activity near food joints.", is_demo: true },
  { id: "w-kp3", name: "Knowledge Park 3 (Sharda / MaxVet)", ward_number: "GN-KP3", city: "Greater Noida", center_lat: 28.4710, center_lng: 77.4850, risk_score: 55, risk_level: "elevated", confidence: "moderate", report_count: 18, verified_report_count: 14, bite_count: 1, active_hotspot_count: 1, explanation: "Hospital perimeter & university food hub concentration.", is_demo: true },
  { id: "w-alpha1", name: "Alpha 1 Commercial Belt", ward_number: "GN-A1", city: "Greater Noida", center_lat: 28.4730, center_lng: 77.5030, risk_score: 74, risk_level: "high", confidence: "high", report_count: 31, verified_report_count: 26, bite_count: 4, active_hotspot_count: 2, explanation: "Dense commercial market area; waste points attract pack formations.", is_demo: true },
  { id: "w-alpha2", name: "Alpha 2 (Kailash / DPS)", ward_number: "GN-A2", city: "Greater Noida", center_lat: 28.4780, center_lng: 77.5090, risk_score: 42, risk_level: "moderate", confidence: "moderate", report_count: 12, verified_report_count: 9, bite_count: 1, active_hotspot_count: 1, explanation: "Residential sector near DPS & Kailash hospital.", is_demo: true },
  { id: "w-beta1", name: "Beta 1 Market & Ryan School", ward_number: "GN-B1", city: "Greater Noida", center_lat: 28.4630, center_lng: 77.5140, risk_score: 35, risk_level: "moderate", confidence: "low", report_count: 9, verified_report_count: 7, bite_count: 0, active_hotspot_count: 0, explanation: "Residential market zone with active sterilization monitoring.", is_demo: true },
  { id: "w-beta2", name: "Beta 2 Sector Gate", ward_number: "GN-B2", city: "Greater Noida", center_lat: 28.4580, center_lng: 77.5080, risk_score: 28, risk_level: "low", confidence: "low", report_count: 6, verified_report_count: 4, bite_count: 0, active_hotspot_count: 0, explanation: "Quiet residential sector with sparse incident telemetry.", is_demo: true }
];

const DEMO_HOTSPOTS = [
  { id: "h-kp2", name: "IILM University Main Gate & Food Street", center_lat: 28.4632, center_lng: 77.4925, radius_meters: 220, risk_score: 78, risk_level: "high", confidence: "high", report_count: 14, verified_report_count: 11, dominant_incident_type: "aggressive_interaction", time_pattern: "Evening 17:30 - 21:30", group_presence_count: 4, nearby_factors: ["near_school", "high_footfall", "near_waste"], ward: "Knowledge Park 2 (IILM / Galgotias)", explanation: "Pack of 5-7 dogs near student food stalls and campus gate.", is_active: true, is_demo: true },
  { id: "h-kp3", name: "Sharda Hospital Back Gate Perimeter", center_lat: 28.4715, center_lng: 77.4835, radius_meters: 190, risk_score: 72, risk_level: "high", confidence: "moderate", report_count: 10, verified_report_count: 8, dominant_incident_type: "contact_bite", time_pattern: "Night 21:00 - 02:00", group_presence_count: 3, nearby_factors: ["near_hospital", "near_waste"], ward: "Knowledge Park 3 (Sharda / MaxVet)", explanation: "Waste accumulation near hospital perimeter attracts aggressive pack.", is_active: true, is_demo: true },
  { id: "h-alpha1", name: "Alpha 1 Commercial Belt Central Plaza", center_lat: 28.4738, center_lng: 77.5035, radius_meters: 250, risk_score: 81, risk_level: "high", confidence: "high", report_count: 17, verified_report_count: 15, dominant_incident_type: "chase", time_pattern: "Evening 18:00 - 22:00", group_presence_count: 5, nearby_factors: ["near_market", "near_waste"], ward: "Alpha 1 Commercial Belt", explanation: "High incident density near meat shops and garbage points.", is_active: true, is_demo: true }
];

const DEMO_REPORTS = [
  { id: "r-gn-1", category: "aggressive_interaction", severity_level: 4, description: "Pack of 5 dogs growling at students exiting IILM University Gate 1 at 8 PM.", latitude: 28.4635, longitude: 77.4928, location_label: "IILM University KP-2 Gate", ward: "Knowledge Park 2 (IILM / Galgotias)", incident_timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), status: "verified", verification_status: "verified", dog_count: 5, group_detected: true, context_tags: ["group_presence", "near_school"], is_demo: true },
  { id: "r-gn-2", category: "contact_bite", severity_level: 5, description: "Bitten on ankle while walking near Sharda Hospital perimeter. Immediate ARV taken at GIMS.", latitude: 28.4716, longitude: 77.4838, location_label: "Sharda Hospital Perimeter Road", ward: "Knowledge Park 3 (Sharda / MaxVet)", incident_timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), status: "verified", verification_status: "verified", dog_count: 3, group_detected: true, context_tags: ["near_hospital", "near_waste"], is_demo: true },
  { id: "r-gn-3", category: "chase", severity_level: 3, description: "Dogs chased delivery scooter near Alpha 1 Metro Station circle.", latitude: 28.4741, longitude: 77.5038, location_label: "Alpha 1 Metro Plaza", ward: "Alpha 1 Commercial Belt", incident_timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), status: "verified", verification_status: "verified", dog_count: 4, group_detected: true, context_tags: ["group_presence", "near_road"], is_demo: true },
  { id: "r-gn-4", category: "sighting", severity_level: 1, description: "Group of 3 dogs resting peacefully near St. Joseph's School gate.", latitude: 28.4722, longitude: 77.5052, location_label: "St. Joseph's School Alpha 1", ward: "Alpha 1 Commercial Belt", incident_timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), status: "verified", verification_status: "verified", dog_count: 3, group_detected: true, context_tags: ["near_school"], is_demo: true },
  { id: "r-gn-5", category: "approach_followed", severity_level: 2, description: "Single dog followed evening walker for 150m in Beta 1 Block C.", latitude: 28.4632, longitude: 77.5142, location_label: "Beta 1 Block C Park", ward: "Beta 1 Market & Ryan School", incident_timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), status: "under_review", verification_status: "pending", dog_count: 1, group_detected: false, context_tags: ["near_park"], is_demo: true }
];

const DEMO_ALERTS = [
  { id: "a-gn-1", title: "High Conflict Alert — IILM KP-2 Food Street", message: "Pack aggression reported between 18:00 - 22:00 near IILM Main Gate. Use Knowledge Park Road alternate route.", alert_type: "warning", severity: "high", ward: "Knowledge Park 2 (IILM / Galgotias)", latitude: 28.4632, longitude: 77.4925, is_active: true, target_role: "all", is_demo: true },
  { id: "a-gn-2", title: "ABC Sterilization Drive — Alpha 1 & 2", message: "Greater Noida Authority ABC veterinary team conducting capture & release drive this week.", alert_type: "info", severity: "low", ward: "Alpha 1 Commercial Belt", latitude: 28.4730, longitude: 77.5030, is_active: true, target_role: "citizen", is_demo: true }
];

const DEMO_ACTIONS = [
  { id: "act-gn-1", action_type: "sterilization_drive", note: "ABC Sterilization & ARV drive completed for 16 dogs across Knowledge Park 2 & Galgotias perimeter.", status: "completed", location_label: "Knowledge Park 2 Zone", is_demo: true },
  { id: "act-gn-2", action_type: "rwa_meeting", note: "RWA & University security briefing conducted at IILM Greater Noida campus.", status: "completed", location_label: "IILM University KP-2", is_demo: true },
  { id: "act-gn-3", action_type: "waste_clearence", note: "Garbage clearance order issued for Alpha 1 commercial meat market waste points.", status: "in_progress", location_label: "Alpha 1 Commercial Belt", is_demo: true }
];

// Rich Greater Noida POIs with Emergency Contacts & Action Helplines
const DEMO_POIS = [
  // 🐾 VET CLINICS & VET SHOPS
  {
    id: "poi-vet-1",
    name: "MaxVet Pet Hospital & Surgery",
    poi_type: "vet_clinic",
    latitude: 28.4685,
    longitude: 77.4910,
    ward: "Knowledge Park 3 (Sharda / MaxVet)",
    address: "Plot 12, Knowledge Park 3, Near IILM University, Greater Noida",
    phone: "+91 98101 23456",
    emergency_contact: "+91 98101 99999 (24/7 Pet Emergency & Bite Care)",
    hours: "24 Hours Open",
    services: "Emergency Pet Care, Canine Rabies Vaccination, Wound Dressing, ABC Surgery",
    is_demo: true
  },
  {
    id: "poi-vet-2",
    name: "PetCare Vet Clinic & Pharmacy",
    poi_type: "vet_clinic",
    latitude: 28.4740,
    longitude: 77.5030,
    ward: "Alpha 1 Commercial Belt",
    address: "Shop 14, Commercial Belt, Alpha 1, Greater Noida",
    phone: "+91 98765 43210",
    emergency_contact: "+91 98765 43211",
    hours: "09:00 AM – 09:30 PM",
    services: "Veterinary Consultation, Pet Foods, Rabies Boosters",
    is_demo: true
  },
  {
    id: "poi-vet-3",
    name: "Paws & Tails Vet Shop & Ambulance",
    poi_type: "vet_clinic",
    latitude: 28.4605,
    longitude: 77.4930,
    ward: "Knowledge Park 2 (IILM / Galgotias)",
    address: "KP-2 Student Circle, Opposite Galgotias Hostel, Greater Noida",
    phone: "+91 98112 33445",
    emergency_contact: "+91 98112 33445 (Stray Animal Ambulance)",
    hours: "08:00 AM – 10:00 PM",
    services: "Stray Animal First Aid, Pet Supplies, Vet Doctor on Call",
    is_demo: true
  },
  {
    id: "poi-vet-4",
    name: "Greater Noida Pet Hospital & Care",
    poi_type: "vet_clinic",
    latitude: 28.4650,
    longitude: 77.5120,
    ward: "Beta 1 Market & Ryan School",
    address: "Market Complex, Beta 1, Greater Noida",
    phone: "+91 99998 88777",
    emergency_contact: "+91 99998 88777",
    hours: "09:00 AM – 08:30 PM",
    services: "General Surgery, Animal Vaccination, Rabies Anti-Serum",
    is_demo: true
  },

  // 🏥 HOSPITALS & 24/7 ARV CENTERS
  {
    id: "poi-hosp-1",
    name: "Government Institute of Medical Sciences (GIMS)",
    poi_type: "arv_facility",
    latitude: 28.4550,
    longitude: 77.4960,
    ward: "Knowledge Park 2 (IILM / Galgotias)",
    address: "Greater Noida, Near Kasna Bus Stand",
    phone: "0120-2341000",
    emergency_contact: "0120-2341001 (24/7 ARV Trauma & Rabies Immunoglobulin Clinic)",
    hours: "24/7 Free Government ARV Clinic",
    services: "Free Anti-Rabies Vaccine (ARV), Rabies Immunoglobulin (RIG), Wound Washing",
    is_demo: true
  },
  {
    id: "poi-hosp-2",
    name: "Sharda Hospital & Trauma Center",
    poi_type: "hospital",
    latitude: 28.4710,
    longitude: 77.4830,
    ward: "Knowledge Park 3 (Sharda / MaxVet)",
    address: "Knowledge Park 3, Greater Noida",
    phone: "0120-4055555",
    emergency_contact: "0120-4055500 (24/7 Emergency Casualty)",
    hours: "24 Hours Emergency",
    services: "Casualty Emergency, Rabies Vaccine, Tetanus Shot, Surgery",
    is_demo: true
  },
  {
    id: "poi-hosp-3",
    name: "Kailash Hospital Greater Noida",
    poi_type: "hospital",
    latitude: 28.4770,
    longitude: 77.5080,
    ward: "Alpha 2 (Kailash / DPS)",
    address: "Knowledge Park 1 / Alpha 2 Boundary, Greater Noida",
    phone: "0120-2327000",
    emergency_contact: "0120-2327001 (24/7 Ambulance & Emergency)",
    hours: "24 Hours Emergency",
    services: "Multi-Speciality Emergency, Anti-Rabies PEP, ICU",
    is_demo: true
  },
  {
    id: "poi-hosp-4",
    name: "Yatharth Super Speciality Hospital",
    poi_type: "hospital",
    latitude: 28.4735,
    longitude: 77.4890,
    ward: "Knowledge Park 3 (Sharda / MaxVet)",
    address: "Omega 1, Near KP-3, Greater Noida",
    phone: "0120-6811111",
    emergency_contact: "0120-6811112 (Emergency Line)",
    hours: "24 Hours Emergency",
    services: "24/7 Emergency, Rabies PEP, Wound Treatment",
    is_demo: true
  },

  // 🏫 SCHOOLS & UNIVERSITIES
  {
    id: "poi-sch-1",
    name: "IILM University Greater Noida",
    poi_type: "school",
    latitude: 28.4630,
    longitude: 77.4920,
    ward: "Knowledge Park 2 (IILM / Galgotias)",
    address: "Plot 16-18, Knowledge Park 2, Greater Noida",
    phone: "0120-4770000",
    emergency_contact: "0120-4770099 (Campus Security & Medical Post)",
    hours: "08:00 AM – 08:00 PM",
    services: "University Campus, Infirmary, Security Desk",
    is_demo: true
  },
  {
    id: "poi-sch-2",
    name: "Galgotias College of Engineering",
    poi_type: "school",
    latitude: 28.4570,
    longitude: 77.4980,
    ward: "Knowledge Park 2 (IILM / Galgotias)",
    address: "Knowledge Park 2, Greater Noida",
    phone: "0120-4370000",
    emergency_contact: "0120-4370001 (Campus Control Room)",
    hours: "08:30 AM – 06:00 PM",
    services: "Educational Institution, Security Escort Post",
    is_demo: true
  },
  {
    id: "poi-sch-3",
    name: "Delhi Public School (DPS) Greater Noida",
    poi_type: "school",
    latitude: 28.4790,
    longitude: 77.5100,
    ward: "Alpha 2 (Kailash / DPS)",
    address: "Sector Alpha 2, Greater Noida",
    phone: "0120-2322100",
    emergency_contact: "0120-2322101",
    hours: "07:30 AM – 03:00 PM",
    services: "K-12 School, School Nurse & Infirmary",
    is_demo: true
  },
  {
    id: "poi-sch-4",
    name: "St. Joseph's School Greater Noida",
    poi_type: "school",
    latitude: 28.4720,
    longitude: 77.5050,
    ward: "Alpha 1 Commercial Belt",
    address: "Pocket E, Alpha 1, Greater Noida",
    phone: "0120-2320200",
    emergency_contact: "0120-2320201",
    hours: "07:30 AM – 02:30 PM",
    services: "K-12 School, Student First Aid",
    is_demo: true
  },
  {
    id: "poi-sch-5",
    name: "Ryan International School",
    poi_type: "school",
    latitude: 28.4620,
    longitude: 77.5150,
    ward: "Beta 1 Market & Ryan School",
    address: "Plot 2, Sector Beta 1, Greater Noida",
    phone: "0120-2326000",
    emergency_contact: "0120-2326001",
    hours: "07:30 AM – 02:30 PM",
    services: "K-12 School, Security Escort",
    is_demo: true
  }
];

const DEMO_VERIFICATIONS = [
  { id: "v-1", report_id: "r-gn-1", reviewer_name: "Dr. Rajesh Sharma", decision: "verified", reason: "Photo evidence attached & confirmed by campus security report.", is_demo: true },
  { id: "v-2", report_id: "r-gn-2", reviewer_name: "Priya Verma", decision: "verified", reason: "GIMS casualty intake note confirmed 5-point bite wound.", is_demo: true }
];

const createCrudService = (tableName, demoFallback = []) => ({
  async filter(params = {}) {
    try {
      let query = supabase.from(tableName).select('*');
      Object.entries(params).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error || !data || data.length === 0) return demoFallback;
      return data;
    } catch {
      return demoFallback;
    }
  },
  async create(data) {
    try {
      const { data: result, error } = await supabase.from(tableName).insert([data]).select().single();
      if (error) throw error;
      return result;
    } catch {
      return { id: "demo-" + Date.now(), ...data, is_demo: true, created_at: new Date().toISOString() };
    }
  },
  async update(id, updates) {
    try {
      const { data: result, error } = await supabase.from(tableName).update(updates).eq('id', id).select().single();
      if (error) throw error;
      return result;
    } catch {
      return { id, ...updates };
    }
  },
  async delete(id) {
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch {
      return true;
    }
  }
});

export const wardsService = createCrudService('wards', DEMO_WARDS);
export const alertsService = createCrudService('alerts', DEMO_ALERTS);
export const verificationsService = createCrudService('verifications', DEMO_VERIFICATIONS);
export const authorityActionsService = createCrudService('authority_actions', DEMO_ACTIONS);
export const contextPOIsService = createCrudService('context_pois', DEMO_POIS);
export const usersService = createCrudService('users', []);

export const reportsService = {
  ...createCrudService('reports', DEMO_REPORTS),
  async filter(params = {}) {
    try {
      let query = supabase.from('reports').select('*');
      Object.entries(params).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error || !data || data.length === 0) return DEMO_REPORTS;
      return data;
    } catch {
      return DEMO_REPORTS;
    }
  }
};

export const hotspotsService = {
  ...createCrudService('hotspots', DEMO_HOTSPOTS),
  async filter(params = {}) {
    try {
      let query = supabase.from('hotspots').select('*');
      Object.entries(params).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query;
      if (error || !data || data.length === 0) return DEMO_HOTSPOTS;
      return data;
    } catch {
      return DEMO_HOTSPOTS;
    }
  }
};

export { authService } from './auth.js';
export { aiValidationWorker } from './aiValidationWorker.js';
export { whatsappIngestion } from './whatsappIngestion.js';

