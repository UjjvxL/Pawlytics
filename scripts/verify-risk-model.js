// Pawlytics Risk Engine Verification Suite
// Runs real-world telemetry simulation & accuracy validation across Greater Noida & Noida sectors

import { calculateRiskScore, clusterReportsToHotspots } from "../src/lib/riskEngine.js";

// Real-world Test Benchmark Cases for Greater Noida & Noida
const TEST_CASES = [
  {
    case_name: "Case 1: IILM University KP-2 Food Street (High Pack Aggression)",
    location: "Knowledge Park 2, Greater Noida",
    expected_level: "high",
    reports: [
      { id: "gn-1", category: "contact_bite", severity_level: 5, verification_status: "verified", cv_uncertainty: "CONFIRMED", group_detected: true, context_tags: ["near_school", "near_waste", "evening"], incident_timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), latitude: 28.4632, longitude: 77.4925 },
      { id: "gn-2", category: "aggressive_interaction", severity_level: 4, verification_status: "verified", cv_uncertainty: "CONFIRMED", group_detected: true, context_tags: ["near_school", "evening"], incident_timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), latitude: 28.4635, longitude: 77.4928 },
      { id: "gn-3", category: "chase", severity_level: 3, verification_status: "verified", cv_uncertainty: "PROBABLE", group_detected: true, context_tags: ["near_road"], incident_timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), latitude: 28.4630, longitude: 77.4920 },
      { id: "gn-4", category: "contact_bite", severity_level: 5, verification_status: "verified", cv_uncertainty: "CONFIRMED", group_detected: true, context_tags: ["near_waste", "night"], incident_timestamp: new Date(Date.now() - 10 * 86400000).toISOString(), latitude: 28.4634, longitude: 77.4922 }
    ]
  },
  {
    case_name: "Case 2: Sharda Hospital KP-3 Waste Disposal Perimeter (Moderate Hospital Risk)",
    location: "Knowledge Park 3, Greater Noida",
    expected_level: "moderate",
    reports: [
      { id: "gn-5", category: "aggressive_interaction", severity_level: 4, verification_status: "verified", cv_uncertainty: "CONFIRMED", group_detected: true, context_tags: ["near_hospital", "near_waste"], incident_timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), latitude: 28.4715, longitude: 77.4835 },
      { id: "gn-6", category: "chase", severity_level: 3, verification_status: "verified", cv_uncertainty: "PROBABLE", group_detected: false, context_tags: ["near_hospital"], incident_timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), latitude: 28.4718, longitude: 77.4838 }
    ]
  },
  {
    case_name: "Case 3: Sector 50 Noida Residential Park (Low Incident Density / Peaceful Sighting)",
    location: "Sector 50, Noida",
    expected_level: "low",
    reports: [
      { id: "n-1", category: "sighting", severity_level: 1, verification_status: "verified", cv_uncertainty: "CONFIRMED", group_detected: false, context_tags: ["near_park"], incident_timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), latitude: 28.5762, longitude: 77.3639 }
    ]
  },
  {
    case_name: "Case 4: Alpha 1 Commercial Belt Meat Market (High Density Waste & Multi-Incident Cluster)",
    location: "Alpha 1 Commercial Belt, Greater Noida",
    expected_level: "high",
    reports: [
      { id: "gn-7", category: "contact_bite", severity_level: 5, verification_status: "verified", cv_uncertainty: "CONFIRMED", group_detected: true, context_tags: ["near_waste", "evening"], incident_timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), latitude: 28.4738, longitude: 77.5035 },
      { id: "gn-8", category: "aggressive_interaction", severity_level: 4, verification_status: "verified", cv_uncertainty: "CONFIRMED", group_detected: true, context_tags: ["near_market"], incident_timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), latitude: 28.4740, longitude: 77.5037 },
      { id: "gn-9", category: "chase", severity_level: 3, verification_status: "verified", cv_uncertainty: "CONFIRMED", group_detected: true, context_tags: ["near_road"], incident_timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), latitude: 28.4736, longitude: 77.5032 },
      { id: "gn-10", category: "contact_bite", severity_level: 5, verification_status: "verified", cv_uncertainty: "CONFIRMED", group_detected: true, context_tags: ["near_waste", "night"], incident_timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), latitude: 28.4742, longitude: 77.5039 }
    ]
  },
  {
    case_name: "Case 5: Unverified Spam / Machine Vision Uncertain Reports (CV Tier Resilience Test)",
    location: "Beta 2 Sector Gate, Greater Noida",
    expected_level: "low",
    reports: [
      { id: "gn-11", category: "contact_bite", severity_level: 5, verification_status: "pending", cv_uncertainty: "REJECTED", group_detected: false, context_tags: [], incident_timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), latitude: 28.4580, longitude: 77.5080 },
      { id: "gn-12", category: "chase", severity_level: 3, verification_status: "verified", cv_uncertainty: "UNCERTAIN", group_detected: false, context_tags: [], incident_timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), latitude: 28.4582, longitude: 77.5082 }
    ]
  }
];

function runVerificationSuite() {
  console.log("=========================================================================");
  console.log("PAWLYTICS RISK ENGINE — AUTOMATED MODEL VERIFICATION & ACCURACY TEST");
  console.log("Testing Telemetry across Greater Noida (KP-2, KP-3, Alpha 1, Beta 2) & Noida");
  console.log("=========================================================================\n");

  let passedCount = 0;
  const allReports = [];

  TEST_CASES.forEach((tc, index) => {
    console.log(`[TEST ${index + 1}] ${tc.case_name}`);
    console.log(`📍 Location: ${tc.location}`);
    
    const result = calculateRiskScore(tc.reports);
    const passed = result.level === tc.expected_level;

    if (passed) passedCount++;

    console.log(`  ├─ Risk Score Calculated: ${result.score} / 100`);
    console.log(`  ├─ Assigned Level:        ${result.level.toUpperCase()} (Expected: ${tc.expected_level.toUpperCase()})`);
    console.log(`  ├─ Data Confidence:      ${result.confidence}`);
    console.log(`  ├─ Audit Trail Factors:  ${result.explanation.join(" | ")}`);
    console.log(`  └─ Test Status:          ${passed ? "✅ PASS" : "❌ FAIL"}\n`);

    tc.reports.forEach(r => allReports.push(r));
  });

  // Test Spatial DBSCAN Clustering across combined dataset
  console.log("-------------------------------------------------------------------------");
  console.log("SPATIAL DBSCAN CLUSTERING TEST across Greater Noida Telemetry:");
  console.log("-------------------------------------------------------------------------");
  const hotspots = clusterReportsToHotspots(allReports, 0.3, 2);
  console.log(`Found ${hotspots.length} Dynamic Hotspot Clusters:`);
  
  hotspots.forEach((h, i) => {
    console.log(`  🔥 Cluster #${i + 1} Center: [${h.centerLat.toFixed(4)}, ${h.centerLng.toFixed(4)}] | Reports: ${h.reports.length} | Risk Score: ${h.score}/100 (${h.level})`);
  });

  console.log("\n=========================================================================");
  console.log(`SUMMARY: ${passedCount} / ${TEST_CASES.length} Test Cases Passed (${((passedCount / TEST_CASES.length) * 100).toFixed(1)}% Benchmark Accuracy)`);
  console.log("=========================================================================\n");
}

runVerificationSuite();
