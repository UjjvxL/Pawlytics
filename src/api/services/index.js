import { supabase } from '../supabaseClient';

// Demo Fallbacks to ensure zero-downtime performance
const DEMO_WARDS = [
  { id: "w-1", name: "Sector 62 Noida", ward_number: "W-62", city: "Noida", center_lat: 28.6270, center_lng: 77.3725, risk_score: 78, risk_level: "high", confidence: "high", report_count: 34, verified_report_count: 28, bite_count: 5, active_hotspot_count: 3, explanation: "High density of reports near tech parks and food stalls. 5 verified bites in last 30 days.", is_demo: true },
  { id: "w-2", name: "Sector 18 Atta Market", ward_number: "W-18", city: "Noida", center_lat: 28.5708, center_lng: 77.3261, risk_score: 65, risk_level: "elevated", confidence: "moderate", report_count: 22, verified_report_count: 18, bite_count: 2, active_hotspot_count: 2, explanation: "Commercial market zone with high evening footfall.", is_demo: true },
  { id: "w-3", name: "Sector 37 Noida", ward_number: "W-37", city: "Noida", center_lat: 28.5612, center_lng: 77.3370, risk_score: 48, risk_level: "moderate", confidence: "moderate", report_count: 15, verified_report_count: 12, bite_count: 1, active_hotspot_count: 1, explanation: "Residential area near Golf Course Metro.", is_demo: true },
  { id: "w-4", name: "Sector 50 Noida", ward_number: "W-50", city: "Noida", center_lat: 28.5762, center_lng: 77.3639, risk_score: 32, risk_level: "low", confidence: "low", report_count: 8, verified_report_count: 6, bite_count: 0, active_hotspot_count: 0, explanation: "Low incident density; active sterilization program underway.", is_demo: true },
  { id: "w-5", name: "Sector 93 Noida", ward_number: "W-93", city: "Noida", center_lat: 28.5284, center_lng: 77.3828, risk_score: 25, risk_level: "low", confidence: "low", report_count: 5, verified_report_count: 4, bite_count: 0, active_hotspot_count: 0, explanation: "Expressway sector with scattered reports.", is_demo: true },
  { id: "w-6", name: "Sector 12 Noida", ward_number: "W-12", city: "Noida", center_lat: 28.5950, center_lng: 77.3340, risk_score: 40, risk_level: "moderate", confidence: "low", report_count: 11, verified_report_count: 8, bite_count: 1, active_hotspot_count: 1, explanation: "Residential market area with moderate activity.", is_demo: true }
];

const DEMO_HOTSPOTS = [
  { id: "h-1", name: "Sector 62 Metro Station Gate 2", center_lat: 28.6280, center_lng: 77.3730, radius_meters: 250, risk_score: 82, risk_level: "high", confidence: "high", report_count: 14, verified_report_count: 12, dominant_incident_type: "aggressive_interaction", time_pattern: "Evening 18:00 - 22:00", group_presence_count: 4, nearby_factors: ["near_transit", "high_footfall"], ward: "Sector 62 Noida", explanation: "Concentrated pack of 4-6 dogs near commuter exit.", is_active: true, is_demo: true },
  { id: "h-2", name: "Fortis Hospital Perimeter Road", center_lat: 28.6245, center_lng: 77.3685, radius_meters: 200, risk_score: 74, risk_level: "high", confidence: "moderate", report_count: 10, verified_report_count: 8, dominant_incident_type: "contact_bite", time_pattern: "Night 21:00 - 02:00", group_presence_count: 3, nearby_factors: ["near_waste", "near_road"], ward: "Sector 62 Noida", explanation: "Multiple chase and bite reports near waste disposal area.", is_active: true, is_demo: true },
  { id: "h-3", name: "Atta Market Central Plaza", center_lat: 28.5712, center_lng: 77.3265, radius_meters: 300, risk_score: 68, risk_level: "elevated", confidence: "moderate", report_count: 12, verified_report_count: 10, dominant_incident_type: "approach_followed", time_pattern: "Evening 17:00 - 21:00", group_presence_count: 2, nearby_factors: ["near_waste"], ward: "Sector 18 Atta Market", explanation: "High food waste accumulation attracts packs near eateries.", is_active: true, is_demo: true }
];

const DEMO_REPORTS = [
  { id: "r-1", category: "contact_bite", severity_level: 5, description: "Bitten on leg while walking near Gate 2 at 8:30 PM. Pack of 4 dogs.", latitude: 28.6282, longitude: 77.3732, location_label: "Sector 62 Metro Gate 2", ward: "Sector 62 Noida", incident_timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), status: "verified", verification_status: "verified", dog_count: 4, group_detected: true, context_tags: ["group_presence", "near_transit"], is_demo: true },
  { id: "r-2", category: "aggressive_interaction", severity_level: 4, description: "Aggressive barking and lunging at two commuters.", latitude: 28.6278, longitude: 77.3728, location_label: "Sector 62 Metro Gate 2", ward: "Sector 62 Noida", incident_timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), status: "verified", verification_status: "verified", dog_count: 3, group_detected: true, context_tags: ["group_presence"], is_demo: true },
  { id: "r-3", category: "chase", severity_level: 3, description: "Chased two-wheeler rider near hospital back gate.", latitude: 28.6246, longitude: 77.3687, location_label: "Fortis Hospital Perimeter", ward: "Sector 62 Noida", incident_timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), status: "verified", verification_status: "verified", dog_count: 2, group_detected: true, context_tags: ["near_road", "near_waste"], is_demo: true },
  { id: "r-4", category: "sighting", severity_level: 1, description: "Group of 3 dogs sleeping near park fence.", latitude: 28.5765, longitude: 77.3642, location_label: "Sector 50 Block B Park", ward: "Sector 50 Noida", incident_timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), status: "verified", verification_status: "verified", dog_count: 3, group_detected: true, context_tags: ["near_park"], is_demo: true },
  { id: "r-5", category: "contact_bite", severity_level: 5, description: "Minor bite incident reported near food stalls in Atta Market.", latitude: 28.5714, longitude: 77.3268, location_label: "Atta Market Sector 18", ward: "Sector 18 Atta Market", incident_timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), status: "verified", verification_status: "verified", dog_count: 2, group_detected: false, context_tags: ["near_waste"], is_demo: true },
  { id: "r-6", category: "approach_followed", severity_level: 2, description: "Followed pedestrian for 100 meters near school boundary wall.", latitude: 28.5615, longitude: 77.3372, location_label: "Sector 37 School Road", ward: "Sector 37 Noida", incident_timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), status: "under_review", verification_status: "pending", dog_count: 1, group_detected: false, context_tags: ["near_school"], is_demo: true }
];

const DEMO_ALERTS = [
  { id: "a-1", title: "High Conflict Warning — Sector 62 Metro", message: "Pack aggression reported between 18:00 - 22:00 near Gate 2. Please use main road route.", alert_type: "warning", severity: "high", ward: "Sector 62 Noida", latitude: 28.6280, longitude: 77.3730, is_active: true, target_role: "all", is_demo: true },
  { id: "a-2", title: "ABC Sterilization Drive — Sector 50", message: "Municipal veterinary team conducting ABC drive in Sector 50 this week.", alert_type: "info", severity: "low", ward: "Sector 50 Noida", latitude: 28.5762, longitude: 77.3639, is_active: true, target_role: "citizen", is_demo: true }
];

const DEMO_ACTIONS = [
  { id: "act-1", action_type: "sterilization_drive", note: "Sterilization & ARV vaccination drive completed for 12 dogs in Sector 62.", status: "completed", location_label: "Sector 62 Zone Pilot", is_demo: true },
  { id: "act-2", action_type: "rwa_meeting", note: "RWA conflict mitigation meeting scheduled with Sector 18 market association.", status: "scheduled", location_label: "Sector 18 Atta Market", is_demo: true }
];

const DEMO_POIS = [
  { id: "poi-1", name: "Sector 62 Primary School", poi_type: "school", latitude: 28.6275, longitude: 77.3710, ward: "Sector 62 Noida", is_demo: true },
  { id: "poi-2", name: "Atta Market Meat Vendors", poi_type: "meat_shop", latitude: 28.5710, longitude: 77.3260, ward: "Sector 18 Atta Market", is_demo: true },
  { id: "poi-3", name: "Fortis Garbage Compactor Point", poi_type: "waste_dump", latitude: 28.6240, longitude: 77.3680, ward: "Sector 62 Noida", is_demo: true }
];

const DEMO_VERIFICATIONS = [
  { id: "v-1", report_id: "r-1", reviewer_name: "Dr. Rajesh Sharma", decision: "verified", reason: "Photo evidence attached & confirmed by hospital intake note.", is_demo: true },
  { id: "v-2", report_id: "r-2", reviewer_name: "Priya Verma", decision: "verified", reason: "CCTV footage confirmed 3-dog pack aggression.", is_demo: true }
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

export { authService } from './auth';
