// Pawlytics Demo / Pilot Data — Noida Pilot Zone
// Clearly labeled synthetic data for SIH 2026 demonstration
// DO NOT represent this as real government data

// Noida pilot area: Sector 62 / Sector 18 / Sector 37 zone
export const DEMO_CENTER = { lat: 28.5740, lng: 77.3410 };

export const DEMO_WARDS = [
  { name: "Sector 62 Noida", ward_number: "SEC-62", city: "Noida", center_lat: 28.6276, center_lng: 77.3658, is_demo: true },
  { name: "Sector 18 Atta Market", ward_number: "SEC-18", city: "Noida", center_lat: 28.5707, center_lng: 77.3259, is_demo: true },
  { name: "Sector 37 Noida", ward_number: "SEC-37", city: "Noida", center_lat: 28.5850, center_lng: 77.3550, is_demo: true },
  { name: "Sector 50 Noida", ward_number: "SEC-50", city: "Noida", center_lat: 28.5725, center_lng: 77.3895, is_demo: true },
  { name: "Sector 93 Noida", ward_number: "SEC-93", city: "Noida", center_lat: 28.4980, center_lng: 77.3980, is_demo: true },
  { name: "Sector 12 Noida", ward_number: "SEC-12", city: "Noida", center_lat: 28.5800, center_lng: 77.3300, is_demo: true },
];

export const DEMO_POIS = [
  { name: "Delhi Public School Sector 30", poi_type: "school", latitude: 28.5760, longitude: 77.3555, ward: "Sector 37 Noida", is_demo: true },
  { name: "Apeejay School Sector 16", poi_type: "school", latitude: 28.5800, longitude: 77.3280, ward: "Sector 18 Atta Market", is_demo: true },
  { name: "Amity International School Sector 44", poi_type: "school", latitude: 28.5400, longitude: 77.3500, ward: "Sector 93 Noida", is_demo: true },
  { name: "Sector 62 Waste Collection Point", poi_type: "waste_site", latitude: 28.6260, longitude: 77.3620, ward: "Sector 62 Noida", is_demo: true },
  { name: "Atta Market Garbage Station", poi_type: "waste_site", latitude: 28.5710, longitude: 77.3245, ward: "Sector 18 Atta Market", is_demo: true },
  { name: "Sector 37 Green Belt", poi_type: "park", latitude: 28.5845, longitude: 77.3545, ward: "Sector 37 Noida", is_demo: true },
  { name: "Noida Stadium Sector 21", poi_type: "park", latitude: 28.5810, longitude: 77.3290, ward: "Sector 18 Atta Market", is_demo: true },
  { name: "City Park Sector 50", poi_type: "park", latitude: 28.5720, longitude: 77.3900, ward: "Sector 50 Noida", is_demo: true },
  { name: "Felix Hospital Sector 73 — ARV", poi_type: "arv_facility", latitude: 28.6080, longitude: 77.3760, ward: "Sector 62 Noida", is_demo: true },
  { name: "Metro Hospital Sector 11 — ARV", poi_type: "arv_facility", latitude: 28.5880, longitude: 77.3360, ward: "Sector 12 Noida", is_demo: true },
  { name: "Fortis Hospital Sector 62", poi_type: "hospital", latitude: 28.6200, longitude: 77.3640, ward: "Sector 62 Noida", is_demo: true },
  { name: "Max Hospital Sector 19", poi_type: "hospital", latitude: 28.5720, longitude: 77.3160, ward: "Sector 18 Atta Market", is_demo: true },
  { name: "DND Flyway Junction", poi_type: "road", latitude: 28.5543, longitude: 77.3200, ward: "Sector 18 Atta Market", is_demo: true },
  { name: "Pilot Feeding Zone — Sector 50", poi_type: "feeding_zone", latitude: 28.5725, longitude: 77.3910, ward: "Sector 50 Noida", is_demo: true },
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

// Cluster centers for realistic spatial concentration (Noida)
const CLUSTERS = [
  // Hot cluster: Sector 62 IT corridor waste area — high / very high risk
  { lat: 28.6260, lng: 77.3620, count: 28, severityBias: [3,4,4,5,3,4,5], ward: "Sector 62 Noida", tags: ["near_waste", "near_road", "evening", "night"] },
  // Medium cluster: Sector 18 Atta Market lane
  { lat: 28.5710, lng: 77.3260, count: 18, severityBias: [2,3,3,4,2,3], ward: "Sector 18 Atta Market", tags: ["near_school", "evening", "morning"] },
  // Moderate cluster: Sector 37 near school & market
  { lat: 28.5840, lng: 77.3540, count: 14, severityBias: [2,2,3,2,3,4], ward: "Sector 37 Noida", tags: ["near_waste", "near_road", "night"] },
  // Smaller cluster: Sector 50 residential
  { lat: 28.5730, lng: 77.3895, count: 8, severityBias: [1,2,2,3,1,2], ward: "Sector 50 Noida", tags: ["morning", "evening"] },
  // Sparse: Sector 93 (insufficient data signal)
  { lat: 28.4980, lng: 77.3980, count: 4, severityBias: [1,2,1,2], ward: "Sector 93 Noida", tags: ["near_road"] },
  // Very sparse: Sector 12 (truly unknown risk)
  { lat: 28.5800, lng: 77.3300, count: 2, severityBias: [1,2], ward: "Sector 12 Noida", tags: ["morning"] },
];

const CATEGORIES_BY_SEVERITY = {
  1: "sighting",
  2: "approach_followed",
  3: "chase",
  4: "aggressive_interaction",
  5: "contact_bite",
};

const DESCRIPTIONS = [
  "Pack of dogs blocking the footpath near the IT park service road.",
  "Dog chased me for about 50 meters near the metro station exit.",
  "Three dogs approached aggressively near the garbage collection point.",
  "Dog bit delivery rider on the ankle near the apartment gate.",
  "Large group of dogs gathered near the market stall in the evening.",
  "Dog followed me from the park entrance to the main road.",
  "Two dogs were fighting and one turned toward pedestrians.",
  "Dog came very close and growled — I had to change route.",
  "Morning walk disrupted by 4–5 dogs running in the lane.",
  "Dog snapped at a child near the school gate area.",
  "Dogs sitting near waste pile, one came toward me when I approached.",
  "Evening jog interrupted — dog chased before retreating.",
  "Group of 6 dogs near the abandoned plot, very aggressive behavior.",
  "Heard barking, turned around, 3 dogs were right behind me.",
  "Dog bite on left leg — went to ARV facility for treatment.",
  "Stray dog appeared injured and distressed near the drainage.",
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
    name: "Sector 62 — IT Corridor Waste Zone",
    center_lat: 28.6260,
    center_lng: 77.3620,
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
    ward: "Sector 62 Noida",
    explanation:
      "Risk estimate based on: 21 verified reports in 30 days, 6 contact/bite reports, 9 aggressive interaction reports, frequent group presence, proximity to waste site, evening/night concentration",
    is_active: true,
    is_demo: true,
    last_calculated: new Date().toISOString(),
  },
  {
    name: "Sector 18 — Atta Market Lane",
    center_lat: 28.5710,
    center_lng: 77.3260,
    radius_meters: 200,
    risk_score: 52,
    risk_level: "elevated",
    confidence: "moderate",
    report_count: 18,
    verified_report_count: 13,
    dominant_incident_type: "Chase / Approach",
    time_pattern: "Reports concentrated in morning (07:00–09:00) and evening (17:00–20:00)",
    group_presence_count: 6,
    nearby_factors: ["Near school", "Near garbage station", "High foot traffic"],
    time_window_days: 30,
    ward: "Sector 18 Atta Market",
    explanation:
      "Risk estimate based on: 13 verified reports in 30 days, 3 chase-level reports, proximity to school, morning and evening concentration",
    is_active: true,
    is_demo: true,
    last_calculated: new Date().toISOString(),
  },
  {
    name: "Sector 37 — School Vicinity Cluster",
    center_lat: 28.5840,
    center_lng: 77.3540,
    radius_meters: 220,
    risk_score: 43,
    risk_level: "elevated",
    confidence: "moderate",
    report_count: 14,
    verified_report_count: 10,
    dominant_incident_type: "Chase / Sighting",
    time_pattern: "Night reports (21:00–02:00) predominant",
    group_presence_count: 5,
    nearby_factors: ["Near green belt", "Near road", "Night concentration", "Near school"],
    time_window_days: 30,
    ward: "Sector 37 Noida",
    explanation:
      "Risk estimate based on: 10 verified reports in 30 days, proximity to waste and green belt, night-time concentration, group presence in 5 reports",
    is_active: true,
    is_demo: true,
    last_calculated: new Date().toISOString(),
  },
  {
    name: "Sector 50 — Residential Zone",
    center_lat: 28.5730,
    center_lng: 77.3895,
    radius_meters: 180,
    risk_score: 28,
    risk_level: "moderate",
    confidence: "low",
    report_count: 8,
    verified_report_count: 5,
    dominant_incident_type: "Approach / Sighting",
    time_pattern: "Morning reports more common",
    group_presence_count: 2,
    nearby_factors: ["Residential area", "Near pilot feeding zone"],
    time_window_days: 30,
    ward: "Sector 50 Noida",
    explanation:
      "Risk estimate based on: 5 verified reports in 30 days, mostly low-severity sightings and approaches",
    is_active: true,
    is_demo: true,
    last_calculated: new Date().toISOString(),
  },
];

export const DEMO_ACTIONS = [
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "Noida Authority Animal Welfare — Sector 62 Zone",
    action_type: "abc_team_notified",
    note:
      "ABC sterilization team notified for Sector 62 IT corridor waste zone cluster. 6 dogs estimated in group. Follow-up inspection scheduled.",
    status: "in_progress",
    location_label: "Sector 62 Noida",
    is_demo: true,
  },
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "Noida Authority Solid Waste — Sector 62",
    action_type: "waste_issue_reported",
    note:
      "Waste accumulation at Sector 62 service lane reported to SWM. Dogs attracted to uncovered bins. Request for daily clearance.",
    status: "pending",
    location_label: "Sector 62 Noida",
    is_demo: true,
  },
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "Noida Authority Animal Welfare — Sector 18 Zone",
    action_type: "area_inspection_completed",
    note:
      "Field inspection completed at Sector 18 Atta Market lane. 4 dogs identified near school gate. Parents advisory issued.",
    status: "completed",
    location_label: "Sector 18 Atta Market",
    is_demo: true,
  },
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "Noida Authority Animal Welfare — Sector 50 Zone",
    action_type: "feeding_zone_review",
    note:
      "Pilot feeding zone at Sector 50 under review. Feeding relocated 150m from residential entry to reduce conflict concentration.",
    status: "in_progress",
    location_label: "Sector 50 Noida",
    is_demo: true,
  },
  {
    hotspot_id: null,
    ward_id: null,
    authority_name: "Noida Authority — Sector 62 Office",
    action_type: "public_warning_issued",
    note:
      "Public advisory issued for Sector 62 residents: avoid the waste collection area between 19:00–22:00 until ABC team intervention.",
    status: "completed",
    location_label: "Sector 62 Noida",
    is_demo: true,
  },
];

export const DEMO_ALERTS = [
  {
    title: "New Hotspot — Sector 62 Noida",
    message:
      "High-risk hotspot identified based on 21 verified reports in the last 30 days. Avoid the IT corridor waste zone between 18:00–22:00.",
    alert_type: "new_hotspot",
    severity: "critical",
    ward: "Sector 62 Noida",
    latitude: 28.6260,
    longitude: 77.3620,
    is_active: true,
    is_demo: true,
  },
  {
    title: "Risk Level Elevated — Sector 18 Atta Market",
    message:
      "Conflict activity near Sector 18 Atta Market lane has increased. 13 verified reports this month. Exercise caution near school gate area.",
    alert_type: "risk_elevated",
    severity: "warning",
    ward: "Sector 18 Atta Market",
    latitude: 28.5710,
    longitude: 77.3260,
    is_active: true,
    is_demo: true,
  },
  {
    title: "Contact/Bite Report — Sector 37 Noida",
    message:
      "A contact/bite incident has been reported and verified in Sector 37 Noida near the school vicinity cluster.",
    alert_type: "bite_reported",
    severity: "critical",
    ward: "Sector 37 Noida",
    latitude: 28.5840,
    longitude: 77.3540,
    is_active: true,
    is_demo: true,
  },
  {
    title: "Authority Action — ABC Team Notified",
    message:
      "Noida Authority ABC sterilization team has been notified for the Sector 62 IT corridor waste zone cluster. Intervention in progress.",
    alert_type: "authority_action",
    severity: "info",
    ward: "Sector 62 Noida",
    latitude: 28.6260,
    longitude: 77.3620,
    is_active: true,
    is_demo: true,
  },
];