// Pawlytics Risk Engine
// Explainable, time-decayed composite risk scoring
// Decision-support and risk intelligence model

export const RISK_LEVELS = {
  unknown: { label: "Unknown Risk", color: "#6B7280", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300", badge: "bg-gray-100 text-gray-700" },
  low: { label: "Low", color: "#16A34A", bg: "bg-green-50", text: "text-green-700", border: "border-green-300", badge: "bg-green-100 text-green-800" },
  moderate: { label: "Moderate", color: "#D97706", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", badge: "bg-amber-100 text-amber-800" },
  elevated: { label: "Elevated", color: "#EA580C", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", badge: "bg-orange-100 text-orange-800" },
  high: { label: "High", color: "#DC2626", bg: "bg-red-50", text: "text-red-700", border: "border-red-300", badge: "bg-red-100 text-red-800" },
  very_high: { label: "Very High", color: "#991B1B", bg: "bg-red-100", text: "text-red-800", border: "border-red-400", badge: "bg-red-200 text-red-900" },
};

export const CONFIDENCE_LEVELS = {
  insufficient: { label: "Sparse telemetry", description: "1–2 verified reports", color: "#9CA3AF" },
  low: { label: "Low confidence", description: "3–9 verified reports", color: "#D97706" },
  moderate: { label: "Moderate confidence", description: "10–29 verified reports", color: "#2563EB" },
  high: { label: "High confidence", description: "30+ verified reports", color: "#16A34A" },
};

export const SEVERITY_LABELS = {
  1: { label: "L1 — Sighting", short: "Sighting", color: "#6B7280" },
  2: { label: "L2 — Approach / Followed", short: "Approach", color: "#D97706" },
  3: { label: "L3 — Chase", short: "Chase", color: "#EA580C" },
  4: { label: "L4 — Aggressive Interaction", short: "Aggressive", color: "#DC2626" },
  5: { label: "L5 — Contact / Bite", short: "Bite", color: "#991B1B" },
};

export const CATEGORY_LABELS = {
  sighting: "Dog Sighting",
  approach_followed: "Approached / Followed",
  chase: "Chase",
  aggressive_interaction: "Aggressive Interaction",
  contact_bite: "Contact / Bite",
  injured_animal: "Injured / Distressed Animal",
  other: "Other",
};

export function getConfidenceFromCount(count) {
  if (count < 3) return "insufficient";
  if (count < 10) return "low";
  if (count < 30) return "moderate";
  return "high";
}

export function getRiskLevelFromScore(score) {
  if (score === null || score === undefined) return "unknown";
  if (score < 20) return "low";
  if (score < 40) return "moderate";
  if (score < 70) return "elevated";
  if (score < 88) return "high";
  return "very_high";
}

export function calculateRiskScore(reports) {
  if (!reports || reports.length === 0) return { score: 0, level: "unknown", confidence: "insufficient", explanation: [] };

  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const explanationFactors = [];

  const recentReports = reports.filter(r => {
    const ts = new Date(r.incident_timestamp || r.created_date || Date.now()).getTime();
    return now - ts < THIRTY_DAYS && r.status !== "expired";
  });

  const verifiedReports = recentReports.filter(r => {
    const isVerified = r.verification_status === "verified" || ["verified", "assigned", "resolved"].includes(r.status);
    const isNotRejected = r.cv_uncertainty !== "REJECTED";
    return isVerified && isNotRejected;
  });
  const verifiedCount = verifiedReports.length;

  // Each report decays with a 14-day half-life. Resolved incidents retain only
  // a small historical signal; disputed and low-trust reports contribute less.
  const severityWeight = [0, 0.18, 0.32, 0.52, 0.76, 1];
  const exposure = verifiedReports.reduce((sum, report) => {
    const ageDays = Math.max(0, (now - new Date(report.incident_timestamp || report.created_at).getTime()) / 86_400_000);
    const ageWeight = Math.exp(-Math.LN2 * ageDays / 14);
    const stateWeight = report.status === "resolved" ? 0.25 : 1;
    const trustWeight = Math.max(0.25, Math.min(1, Number(report.trust_weight ?? 0.7)));
    const confirmationWeight = Math.max(0.4, Math.min(1.25,
      1 + Number(report.confirmation_count || 0) * 0.05 - Number(report.dispute_count || 0) * 0.15));
    const dogWeight = 1 + Math.min(0.3, Math.max(0, Number(report.dog_count || 1) - 1) * 0.05);
    const tags = report.context_tags || [];
    const contextWeight = 1
      + (tags.includes("near_school") ? 0.15 : 0)
      + (tags.includes("high_footfall") || tags.includes("near_market") ? 0.1 : 0)
      + (tags.includes("near_waste") ? 0.08 : 0)
      + (tags.includes("evening") || tags.includes("night") ? 0.1 : 0);
    return sum + severityWeight[report.severity_level || 1] * ageWeight * stateWeight
      * trustWeight * confirmationWeight * dogWeight * contextWeight;
  }, 0);

  // Saturating curve: recurrence raises risk without letting raw volume dominate.
  const finalScore = Math.min(100, Math.round(100 * (1 - Math.exp(-exposure / 3.2))));
  if (verifiedCount > 0) explanationFactors.push(`${verifiedCount} verified report${verifiedCount > 1 ? "s" : ""}, weighted by age and trust`);

  const biteCount = verifiedReports.filter(r => r.severity_level >= 5).length;
  const aggressiveCount = verifiedReports.filter(r => r.severity_level === 4).length;
  const chaseCount = verifiedReports.filter(r => r.severity_level === 3).length;

  if (biteCount > 0) explanationFactors.push(`${biteCount} contact/bite report${biteCount > 1 ? 's' : ''}`);
  if (aggressiveCount > 0) explanationFactors.push(`${aggressiveCount} aggressive interaction report${aggressiveCount > 1 ? 's' : ''}`);
  if (chaseCount > 0) explanationFactors.push(`${chaseCount} chase report${chaseCount > 1 ? 's' : ''}`);

  const groupCount = verifiedReports.filter(r => r.group_detected || (r.context_tags && r.context_tags.includes("group_presence"))).length;
  if (groupCount > 0) explanationFactors.push(`${groupCount} reports with group presence`);

  const wasteProximity = verifiedReports.filter(r => r.context_tags && r.context_tags.includes("near_waste")).length;
  const schoolProximity = verifiedReports.filter(r => r.context_tags && r.context_tags.includes("near_school")).length;
  const hospitalProximity = verifiedReports.filter(r => r.context_tags && r.context_tags.includes("near_hospital")).length;
  if (wasteProximity > 0) explanationFactors.push("proximity to waste site");
  if (schoolProximity > 0) explanationFactors.push("proximity to school or public institution");
  if (hospitalProximity > 0) explanationFactors.push("proximity to hospital perimeter");

  const eveningNight = verifiedReports.filter(r => r.context_tags && (r.context_tags.includes("evening") || r.context_tags.includes("night"))).length;
  if (eveningNight > 0) explanationFactors.push("evening/night concentration");
  if (verifiedCount >= 3) explanationFactors.push("recurrent incidents in the current 30-day window");

  const confidence = getConfidenceFromCount(verifiedCount);
  const level = getRiskLevelFromScore(finalScore);

  return { score: finalScore, level, confidence, explanation: explanationFactors, verifiedCount, totalCount: recentReports.length, exposure };
}

export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export function clusterReportsToHotspots(reports, radiusKm = 0.3, minPoints = 2) {
  const verified = reports.filter(r => (r.verification_status === "verified" || r.status === "verified") && r.cv_uncertainty !== "REJECTED");
  if (verified.length < minPoints) return [];
  
  const clusters = [];
  const visited = new Set();
  
  for (let i = 0; i < verified.length; i++) {
    if (visited.has(i)) continue;
    const neighbors = [];
    for (let j = 0; j < verified.length; j++) {
      const lat1 = verified[i].latitude ?? verified[i].center_lat ?? 0;
      const lng1 = verified[i].longitude ?? verified[i].center_lng ?? 0;
      const lat2 = verified[j].latitude ?? verified[j].center_lat ?? 0;
      const lng2 = verified[j].longitude ?? verified[j].center_lng ?? 0;

      if (i !== j && getDistanceKm(lat1, lng1, lat2, lng2) <= radiusKm) {
        neighbors.push(j);
      }
    }
    if (neighbors.length + 1 >= minPoints) {
      const cluster = [i, ...neighbors];
      cluster.forEach(idx => visited.add(idx));
      const clusterReports = cluster.map(idx => verified[idx]);
      const centerLat = clusterReports.reduce((s, r) => s + (r.latitude ?? r.center_lat ?? 0), 0) / clusterReports.length;
      const centerLng = clusterReports.reduce((s, r) => s + (r.longitude ?? r.center_lng ?? 0), 0) / clusterReports.length;
      const riskResult = calculateRiskScore(clusterReports);
      clusters.push({ reports: clusterReports, centerLat, centerLng, ...riskResult });
    }
  }
  return clusters;
}
