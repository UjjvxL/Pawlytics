import { getDistanceKm } from "./riskEngine.js";

export const REPORT_STATUS = Object.freeze({
  SUBMITTED: "submitted",
  PENDING: "pending_verification",
  VERIFIED: "verified",
  ASSIGNED: "assigned",
  RESOLVED: "resolved",
  EXPIRED: "expired",
  REJECTED: "rejected",
  DUPLICATE: "duplicate",
});

export const REPORT_STATUS_LABELS = Object.freeze({
  submitted: "Submitted",
  pending_verification: "Pending verification",
  verified: "Verified",
  assigned: "Assigned to field team",
  resolved: "Resolved",
  expired: "Expired",
  rejected: "Rejected",
  duplicate: "Duplicate",
  // Legacy records remain readable during migration.
  under_review: "Pending verification",
});

export const REPORT_TRANSITIONS = Object.freeze({
  submitted: ["pending_verification", "expired"],
  pending_verification: ["verified", "rejected", "duplicate", "expired"],
  verified: ["assigned", "resolved", "expired"],
  assigned: ["resolved", "expired"],
  resolved: [], expired: [], rejected: [], duplicate: [],
});

export function canTransitionReport(from, to) {
  return REPORT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getReportExpiry(incidentTimestamp, days = 30) {
  const timestamp = new Date(incidentTimestamp).getTime();
  return new Date(timestamp + days * 86_400_000).toISOString();
}

const words = (value = "") => new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g) || []);

function descriptionSimilarity(a, b) {
  const left = words(a);
  const right = words(b);
  if (!left.size || !right.size) return 0;
  const shared = [...left].filter((word) => right.has(word)).length;
  return shared / new Set([...left, ...right]).size;
}

/** Deterministic duplicate signal for moderator triage; it never auto-rejects. */
export function scorePotentialDuplicate(report, candidate) {
  const hours = Math.abs(new Date(report.incident_timestamp).getTime() - new Date(candidate.incident_timestamp).getTime()) / 3_600_000;
  if (hours > 24) return 0;
  const distanceKm = getDistanceKm(report.latitude, report.longitude, candidate.latitude, candidate.longitude);
  if (distanceKm > 0.5) return 0;

  const category = report.category === candidate.category ? 0.3 : 0;
  const distance = 0.35 * Math.max(0, 1 - distanceKm / 0.5);
  const time = 0.25 * Math.max(0, 1 - hours / 24);
  const description = 0.1 * descriptionSimilarity(report.description, candidate.description);
  return Math.round(Math.min(1, category + distance + time + description) * 100) / 100;
}

export function findPotentialDuplicates(report, candidates, threshold = 0.65) {
  return candidates
    .filter((candidate) => candidate.id !== report.id)
    .map((candidate) => ({ report: candidate, score: scorePotentialDuplicate(report, candidate) }))
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score);
}

export function calculateReporterTrust({ confirmed = 0, rejected = 0, falseReports = 0 } = {}) {
  const observations = confirmed + rejected + falseReports;
  if (!observations) return 0.5;
  // Bayesian prior avoids extreme scores for new reporters.
  return Math.max(0.1, Math.min(1, (confirmed + 2) / (observations + falseReports * 2 + 4)));
}
