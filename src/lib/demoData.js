// Pawlytics Demo / Pilot Data
// Clearly labeled synthetic data for SIH 2026 demonstration
// DO NOT represent this as real government data

// Bengaluru pilot area: Koramangala / HSR Layout / BTM Layout zone
export const DEMO_CENTER = { lat: 12.9279, lng: 77.6271 };

export const DEMO_WARDS = [
  { name: "Koramangala 5th Block", ward_number: "KOR-5", city: "Bengaluru", center_lat: 12.9279, center_lng: 77.6271, is_demo: true },
  { name: "HSR Layout Sector 1", ward_number: "HSR-1", city: "Bengaluru", center_lat: 12.9116, center_lng: 77.6389, is_demo: true },
  { name: "BTM Layout 2nd Stage", ward_number: "BTM-2", city: "Bengaluru", center_lat: 12.9166, center_lng: 77.6101, is_demo: true },
  { name: "Indiranagar 12th Main", ward_number: "IND-12", city: "Bengaluru", center_lat: 12.9784, center_lng: 77.6408, is_demo: true },
  { name: "Domlur Extension", ward_number: "DOM-1", city: "Bengaluru", center_lat: 12.9591, center_lng: 77.6378, is_demo: true },
  { name: "Ejipura", ward_number: "EJI-1", city: "Bengaluru", center_lat: 12.9408, center_lng: 77.6276, is_demo: true },
];

export const DEMO_POIS = [
  { name: "National Public School Koramangala", poi_type: "school", latitude: 12.9310, longitude: 77.6280, ward: "Koramangala 5th Block", is_demo: true },
  { name: "Frank Anthony Public School", poi_type: "school", latitude: 12.9780, longitude: 77.6421, ward: "Indiranagar 12th Main", is_demo: true },
  { name: "Baldwin Boys' High School", poi_type: "school", latitude: 12.9175, longitude: 77.6180, ward: "BTM Layout 2nd Stage", is_demo: true },
  { name: "Koramangala Market Waste Point", poi_type: "waste_site", latitude: 12.9265, longitude: 77.6258, ward: "Koramangala 5th Block", is_demo: true },
  { name: "BTM Lake Road Dump Yard", poi_type: "waste_site", latitude: 12.9142, longitude: 77.6098, ward: "BTM Layout 2nd Stage", is_demo: true },
  { name: "Indiranagar Garbage Transfer Station", poi_type: "waste_site", latitude: 12.9790, longitude: 77.6395, ward: "Indiranagar 12th Main", is_demo: true },
  { name: "Koramangala Indoor Stadium Park", poi_type: "park", latitude: 12.9320, longitude: 77.6310, ward: "Koramangala 5th Block", is_demo: true },
  { name: "Ejipura Sliver Park", poi_type: "park", latitude: 12.9420, longitude: 77.6290, ward: "Ejipura", is_demo: true },
  { name: "St John's Medical Centre ARV", poi_type: "arv_facility", latitude: 12.9249, longitude: 77.6210, ward: "Koramangala 5th Block", is_demo: true },
  { name: "Bowring & Lady Curzon Hospital ARV", poi_type: "arv_facility", latitude: 12.9765, longitude: 77.6010, ward: "Indiranagar 12th Main", is_demo: true },
  { name: "Koramangala Multi-Specialty Hospital", poi_type: "hospital", latitude: 12.9295, longitude: 77.6301, ward: "Koramangala 5th Block", is_demo: true },
  { name: "HSR BDA Community Health Centre", poi_type: "hospital", latitude: 12.9120, longitude: 77.6405, ward: "HSR Layout Sector 1", is_demo: true },
  { name: "Outer Ring Road (Koramangala Junction)", poi_type: "road", latitude: 12.9246, longitude: 77.6220, ward: "Koramangala 5th Block", is_demo: true },
  { name: "Pilot Feeding Zone — BTM Lake Rd", poi_type: "feeding_zone", latitude: 12.9155, longitude: 77.6115, ward: "BTM Layout 2nd Stage", is_demo: true },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function randBetween(a, b) {
  return a + Math.random() * (b - a);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Cluster centers for realistic spatial concentration
const CLUSTERS = [
  // Hot cluster: Koramangala 5th Block waste area - elevated risk
  { lat: 12.9265, lng: 77.6258, count: 28, severityBias: [3,4,4,5,3,4,5], ward: "Koramangala 5th Block", tags: ["near_waste", "near_road", "evening", "night"] },
  // Medium cluster: Indiranagar market lane
  { lat: 12.9784, lng: 77.6408, count: 18, severityBias: [2,3,3,4,2,3], ward: "Indiranagar 12th Main", tags: ["near_school", "evening", "morning"] },
  // Moderate cluster: BTM Layout lake road
  { lat: 12.9142, lng: 77.6098, count: 14, severityBias: [2,2,3,2,3,4], ward: "BTM Layout 2nd Stage", tags: ["near_waste", "near_road", "night"] },
  // Smaller cluster: HSR Sector 1 residential
  { lat: 12.9116, lng: 77.6389, count: 8, severityBias: [1,2,2,3,1,2], ward: "HSR Layout Sector 1", tags: ["morning", "evening"] },
  // Sparse: Domlur (low confidence — insufficient data signal)
  { lat: 12.9591, lng: 77.6378, count: 4, severityBias: [1,2,1,2], ward: "Domlur Extension", tags: ["near_road"] },
  // Very sparse: Ejipura (truly unknown risk)
  { lat: 12.9408, lng: 77.6276, count: 2, severityBias: [1,2], ward: "Ejipura", tags: ["morning"] },
];

const CATEGORIES_BY_SEVERITY = {
  1: "sighting",
  2: "approach_followed",
  3: "chase",
  4: "aggressive_interaction",
  5: "contact_bite",
};

const DESCRIPTIONS = [
  "Pack of dogs blocking the footpath near the junction.",
  "Dog chased me for about 50 meters near the bus stop.",
  "Three dogs approached aggressively near the waste bin area.",
  "Dog bit delivery rider on the ankle near the apartment gate.",
  "Large group of dogs gathered near the evening market stall.",
  "Dog followed me from the park entrance to the main road.",
  "Two dogs were fighting and one turned toward pedestrians.",
  "Dog came very close and growled — I had to change route.",
  "Morning walk disrupted by 4–5 dogs running in the lane.",
  "Dog snapped at a child near the school gate area.",
  "Dogs sitting near waste pile, one came toward me when I approached.",
  "Evening jog interrupted — dog chased before retreating.",
  "Group of 6 dogs near the abandoned plot, very aggressive behavior.",
  "Heard barking, turned around, 3 dogs were right behind me.",
  "Dog bite on left leg — went to ARV for treatment.",
  "Stray dog appeared injured and distressed near the drain.",
  "Dogs were chasing vehicles and then turned on pedestrians.",
  "Two dogs were snarling at each other, I got caught in the middle.",
];

const REPORTER_NAMES = ["Anonymous", "Demo Reporter", "Pilot User", "Field Observer"];

export function generateDemoReports() {
  const reports = [];
  let index = 0;
  
  for (const cluster of CLUSTERS) {
    const isVerifiedCluster = cluster.count >= 8;
    
    for (let i = 0; i < cluster.count; i++) {
      const severity = pick(cluster.severityBias);
      const category = CATEGORIES_BY_SEVERITY[severity] || "sighting";
      const daysOld = Math.floor(randBetween(0, 45));
      const extraTags = [];
      if (Math.random() > 0.5) extraTags.push(pick(cluster.tags));
      if (severity >= 3 && Math.random() > 0.6) extraTags.push("group_presence");
      const allTags = [...new Set([...extraTags])];
      
      const hasCv = Math.random() > 0.4;
      const cvDogs = Math.floor(randBetween(1, 7));
      const cvConf = randBetween(0.65, 0.97);
      
      // Determine verification status
      let status = "under_review";
      let verificationStatus = "pending";
      
      if (isVerifiedCluster && i < cluster.count * 0.75) {
        status = "verified";
        verificationStatus = "verified";
      } else if (i === cluster.count - 1 && cluster.count > 4) {
        status = "rejected";
        verificationStatus = "rejected";
      } else if (i === cluster.count - 2 && cluster.count > 6) {
        status = "duplicate";
        verificationStatus = "rejected";
      }
      
      reports.push({
        reporter_id: `demo_user_${(index % 8) + 1}`,
        reporter_name: pick(REPORTER_NAMES),
        category,
        severity_level: severity,
        description: pick(DESCRIPTIONS),
        latitude: cluster.lat + randBetween(-0.003, 0.003),
        longitude: cluster.lng + randBetween(-0.003, 0.003),
        location_label: cluster.ward,
        ward: cluster.ward,
        incident_timestamp: daysAgo(daysOld),
        status,
        verification_status: verificationStatus,
        dog_count: Math.floor(randBetween(1, 5)),
        group_detected: severity >= 3 && Math.random() > 0.5,
        context_tags: allTags,
        cv_dog_count: hasCv ? cvDogs : null,
        cv_confidence: hasCv ? Math.round(cvConf * 100) / 100 : null,
        cv_group_detected: hasCv ? cvDogs >= 3 : null,
        cv_status: hasCv ? (cvConf < 0.75 ? "low_confidence" : "processed") : "no_image",
        trust_weight: isVerifiedCluster ? 1.0 : 0.7,
        is_demo: true,
      });
      index++;
    }
  }
  
  return reports;
}

export const DEMO_HOTSPOTS = [
  {
    name: "Koramangala 5th Block — Waste Zone",
    center_lat: 12.9265,
    center_lng: 77.6258,
    radius_meters: 280,
    risk_score: 74,
    risk_level: "high",
    confidence: "high",
    report_count: 28,
    verified_report_count: 21,
    dominant_incident_type: "Aggressive Interaction / Chase",
    time_pattern: "Most reports occur between 18:00–22:00",
    group_presence_count: 14,
    nearby_factors: ["Near waste site", "Near major road", "Evening concentration"],
    time_window_days: 30,
    ward: "Koramangala 5th Block",
    explanation: "Risk estimate based on: 21 verified reports in 30 days, 6 contact/bite reports, 9 aggressive interaction reports, frequent group presence, proximity to waste site, evening/night concentration",
    is_active: true,
    is_demo: true,
    last_calculated: new Date().toISOString(),
  },
  {
    name: "Indiranagar 12th Main — Market Lane",
    center_lat: 12.9784,
    center_lng: 77.6408,
    radius_meters: 200,
    risk_score: 52,
    risk_level: "elevated",
    confidence: "moderate",
    report_count: 18,
    verified_report_count: 13,
    dominant_incident_type: "Chase / Approach",
    time_pattern: "Reports concentrated in morning (07:00–09:00) and evening (17:00–20:00)",
    group_presence_count: 6,
    nearby_factors: ["Near school", "Near waste transfer station", "High foot traffic"],
    time_window_days: 30,
    ward: "Indiranagar 12th Main",
    explanation: "Risk estimate based on: 13 verified reports in 30 days, 3 chase-level reports, proximity to school, morning and evening concentration",
    is_active: true,
    is_demo: true,
    last_calculated: new Date().toISOString(),
  },
  {
    name: "BTM Layout — Lake Road Dump Area",
    center_lat: 12.9142,
    center_lng: 77.6098,
    radius_meters: 220,
    risk_score: 43,
    risk_level: "elevated",
    confidence: "moderate",
    report_count: 14,
    verified_report_count: 10,
    dominant_incident_type: "Chase / Sighting",
    time_pattern: "Night reports (21:00–02:00) predominant",
    group_presence_count: 5,
    nearby_factors: ["Near waste dump yard", "Near road", "Night concentration", "Near feeding zone"],
    time_window_days: 30,
    ward: "BTM Layout 2nd Stage",
    explanation: "Risk estimate based on: 10 verified reports in 30 days, proximity to waste dump, night-time concentration, group presence in 5 reports",
    is_active: true,
    is_demo: true,
    last_calculated: new Date().toISOString(),
  },
  {
    name: "HSR Layout Sector 1 — Residential Zone",
    center_lat: 12.9116,
    center_lng: 77.6389,
    radius_meters: 180,
    risk_score: 28,
    risk_level: "moderate",
    confidence: "low",
    report_count: 8,
    verified_report_count: 5,
    dominant_incident_type: "Approach / Sighting",
    time_pattern: "Morning reports more common",
    group_presence_count: 2,
    nearby_factors: ["Residential area"],
    time_window_days: 30,
    ward: "HSR Layout Sector 1",
    explanation: "Risk estimate based on: 5 verified reports in 30 days, mostly low-severity sightings and approaches",
    is_active: true,
    is_demo: true,
    last_calculated: new Date().toISOString(),
  },
];

export const DEMO_ACTIONS = [
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "BBMP Animal Welfare — Koramangala Zone",
    action_type: "abc_team_notified",
    note: "ABC sterilization team notified for Koramangala 5th Block waste zone cluster. 6 dogs estimated in group. Follow-up inspection scheduled.",
    status: "in_progress",
    location_label: "Koramangala 5th Block",
    is_demo: true,
  },
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "BBMP Solid Waste — Ward 151",
    action_type: "waste_issue_reported",
    note: "Waste accumulation at Koramangala 5th Block market lane reported to SWM. Dogs attracted to uncovered bins. Request for daily clearance.",
    status: "pending",
    location_label: "Koramangala 5th Block",
    is_demo: true,
  },
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "BBMP Animal Welfare — Indiranagar Zone",
    action_type: "field_inspection_completed",
    note: "Field inspection completed at Indiranagar 12th Main. 4 dogs identified near school gate. Parents advisory issued.",
    status: "completed",
    location_label: "Indiranagar 12th Main",
    is_demo: true,
  },
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "BBMP Animal Welfare — BTM Zone",
    action_type: "feeding_zone_review",
    note: "Pilot feeding zone at BTM Lake Road under review. Feeding relocated 150m from dump area to reduce conflict concentration.",
    status: "in_progress",
    location_label: "BTM Layout 2nd Stage",
    is_demo: true,
  },
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "BBMP — Ward Commissioner Office",
    action_type: "public_warning_issued",
    note: "Public advisory issued for Koramangala 5th Block residents: avoid the waste collection area between 19:00–22:00 until ABC team intervention.",
    status: "completed",
    location_label: "Koramangala 5th Block",
    is_demo: true,
  },
];

export const DEMO_ALERTS = [
  {
    title: "New Hotspot — Koramangala 5th Block",
    message: "High-risk hotspot identified based on 21 verified reports in the last 30 days. Avoid the waste zone between 18:00–22:00.",
    alert_type: "new_hotspot",
    severity: "critical",
    ward: "Koramangala 5th Block",
    latitude: 12.9265,
    longitude: 77.6258,
    is_active: true,
    is_demo: true,
  },
  {
    title: "Risk Level Elevated — Indiranagar 12th Main",
    message: "Conflict activity near Indiranagar market lane has increased. 13 verified reports this month. Exercise caution near school gate area.",
    alert_type: "risk_elevated",
    severity: "warning",
    ward: "Indiranagar 12th Main",
    latitude: 12.9784,
    longitude: 77.6408,
    is_active: true,
    is_demo: true,
  },
  {
    title: "Contact/Bite Report — BTM Layout",
    message: "A contact/bite incident has been reported and verified in BTM Layout 2nd Stage near the lake road area.",
    alert_type: "bite_reported",
    severity: "critical",
    ward: "BTM Layout 2nd Stage",
    latitude: 12.9142,
    longitude: 77.6098,
    is_active: true,
    is_demo: true,
  },
  {
    title: "Authority Action — ABC Team Notified",
    message: "BBMP ABC sterilization team has been notified for the Koramangala 5th Block waste zone cluster. Intervention in progress.",
    alert_type: "authority_action",
    severity: "info",
    ward: "Koramangala 5th Block",
    latitude: 12.9265,
    longitude: 77.6258,
    is_active: true,
    is_demo: true,
  },
];