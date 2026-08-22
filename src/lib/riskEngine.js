// Pawlytics Risk Engine
// Explainable, time-decayed composite risk scoring
// IMPORTANT: This is decision-support, NOT prediction of individual animal behavior

export const RISK_LEVELS = {
  unknown: { label: "Unknown Risk", color: "#6B7280", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300", badge: "bg-gray-100 text-gray-700" },
  low: { label: "Low", color: "#16A34A", bg: "bg-green-50", text: "text-green-700", border: "border-green-300", badge: "bg-green-100 text-green-800" },
  moderate: { label: "Moderate", color: "#D97706", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", badge: "bg-amber-100 text-amber-800" },
  elevated: { label: "Elevated", color: "#EA580C", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", badge: "bg-orange-100 text-orange-800" },
  high: { label: "High", color: "#DC2626", bg: "bg-red-50", text: "text-red-700", border: "border-red-300", badge: "bg-red-100 text-red-800" },
  very_high: { label: "Very High", color: "#991B1B", bg: "bg-red-100", text: "text-red-800", border: "border-red-400", badge: "bg-red-200 text-red-900" },
};

export const CONFIDENCE_LEVELS = {
  insufficient: { label: "Insufficient data", description: "0–2 verified reports", color: "#9CA3AF" },
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
  if (score < 60) return "elevated";
  if (score < 80) return "high";
  return "very_high";
}

export function calculateRiskScore(reports) {
  if (!reports || reports.length === 0) return { score: 0, level: "unknown", confidence: "insufficient", explanation: [] };
  
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  
  // Time decay: reports in last 30 days weighted more
  let weightedScore = 0;
  const explanationFactors = [];
  
  const recentReports = reports.filter(r => {
    const ts = new Date(r.incident_timestamp || r.created_date).getTime();
    return (now - ts) < THIRTY_DAYS;
  });
  
  const verifiedCount = recentReports.filter(r => {
    const isVerified = r.verification_status === "verified" || r.status === "verified";
    const isNotRejected = r.cv_uncertainty !== "REJECTED";
    return isVerified && isNotRejected;
  }).length;

  // Base: verified report count weighted by CV Uncertainty Tier
  let reportScoreSum = 0;
  recentReports.forEach((r) => {
    const isVerified = r.verification_status === "verified" || r.status === "verified";
    if (!isVerified) return;

    // Uncertainty weighting: prevent unverified low-confidence CV from inflating risk
    const cvWeight =
      r.cv_uncertainty === "CONFIRMED" ? 1.0 :
      r.cv_uncertainty === "PROBABLE"  ? 0.75 :
      r.cv_uncertainty === "UNCERTAIN" ? 0.30 : 0.0;

    reportScoreSum += 3 * cvWeight;
  });

  const reportScore = Math.min(30, reportScoreSum);
  weightedScore += reportScore;
  if (verifiedCount > 0) explanationFactors.push(`${verifiedCount} verified report${verifiedCount > 1 ? 's' : ''} in the last 30 days`);
  
  // Severity distribution (max 25 pts)
  const biteCount = recentReports.filter(r => r.severity_level >= 5).length;
  const aggressiveCount = recentReports.filter(r => r.severity_level === 4).length;
  const chaseCount = recentReports.filter(r => r.severity_level === 3).length;
  
  const severityScore = Math.min(25, (biteCount * 8) + (aggressiveCount * 5) + (chaseCount * 3));
  weightedScore += severityScore;
  
  if (biteCount > 0) explanationFactors.push(`${biteCount} contact/bite report${biteCount > 1 ? 's' : ''}`);
  if (aggressiveCount > 0) explanationFactors.push(`${aggressiveCount} aggressive interaction report${aggressiveCount > 1 ? 's' : ''}`);
  if (chaseCount > 0) explanationFactors.push(`${chaseCount} chase report${chaseCount > 1 ? 's' : ''}`);
  
  // Group presence (max 15 pts)
  const groupCount = recentReports.filter(r => r.group_detected || (r.context_tags && r.context_tags.includes("group_presence"))).length;
  if (groupCount > 0) {
    const groupScore = Math.min(15, groupCount * 4);
    weightedScore += groupScore;
    explanationFactors.push(`${groupCount} reports with group presence`);
  }
  
  // Contextual factors (max 20 pts)
  const wasteProximity = recentReports.filter(r => r.context_tags && r.context_tags.includes("near_waste")).length;
  const schoolProximity = recentReports.filter(r => r.context_tags && r.context_tags.includes("near_school")).length;
  const roadProximity = recentReports.filter(r => r.context_tags && r.context_tags.includes("near_road")).length;
  
  if (wasteProximity > 0) { weightedScore += Math.min(8, wasteProximity * 2); explanationFactors.push("proximity to waste site"); }
  if (schoolProximity > 0) { weightedScore += Math.min(7, schoolProximity * 2); explanationFactors.push("proximity to school or public institution"); }
  if (roadProximity > 0) { weightedScore += Math.min(5, roadProximity * 1); explanationFactors.push("proximity to major road"); }
  
  // Evening/night concentration (max 10 pts)
  const eveningNight = recentReports.filter(r => r.context_tags && (r.context_tags.includes("evening") || r.context_tags.includes("night"))).length;
  if (eveningNight > 0) {
    const timeScore = Math.min(10, eveningNight * 2);
    weightedScore += timeScore;
    explanationFactors.push("evening/night concentration");
  }
  
  const finalScore = Math.min(100, Math.round(weightedScore));
  const confidence = getConfidenceFromCount(verifiedCount);
  const level = confidence === "insufficient" ? "unknown" : getRiskLevelFromScore(finalScore);
  
  return { score: finalScore, level, confidence, explanation: explanationFactors, verifiedCount, totalCount: recentReports.length };
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

export function clusterReportsToHotspots(reports, radiusKm = 0.3, minPoints = 3) {
  // Simplified DBSCAN-like spatial clustering
  const verified = reports.filter(r => r.verification_status === "verified" || r.status === "verified");
  if (verified.length < minPoints) return [];
  
  const clusters = [];
  const visited = new Set();
  
  for (let i = 0; i < verified.length; i++) {
    if (visited.has(i)) continue;
    const neighbors = [];
    for (let j = 0; j < verified.length; j++) {
      if (i !== j && getDistanceKm(verified[i].latitude, verified[i].longitude, verified[j].latitude, verified[j].longitude) <= radiusKm) {
        neighbors.push(j);
      }
    }
    if (neighbors.length + 1 >= minPoints) {
      const cluster = [i, ...neighbors];
      cluster.forEach(idx => visited.add(idx));
      const clusterReports = cluster.map(idx => verified[idx]);
      const centerLat = clusterReports.reduce((s, r) => s + r.latitude, 0) / clusterReports.length;
      const centerLng = clusterReports.reduce((s, r) => s + r.longitude, 0) / clusterReports.length;
      const riskResult = calculateRiskScore(clusterReports);
      clusters.push({ reports: clusterReports, centerLat, centerLng, ...riskResult });
    }
  }
  return clusters;
}