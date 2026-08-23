// Pawlytics AI Machine Vision Validation Worker
// Real-time photo & telemetry verification service for incoming incident reports

import { reportsService } from './index.js';

export const aiValidationWorker = {
  /**
   * Evaluates an uploaded report's image and description metadata
   * Assigns CV uncertainty tier (CONFIRMED, PROBABLE, UNCERTAIN, REJECTED)
   * and auto-calculates dog count & context tags.
   */
  async processReport(report) {
    console.log(`[AI Worker] Analyzing Report ID: ${report.id} (${report.location_label || 'Unknown location'})`);

    const hasPhoto = Boolean(report.photo_url || report.media_url || report.photo_base64);
    const description = (report.description || "").toLowerCase();
    const isDemo = Boolean(report.is_demo);

    // Rule-based heuristic simulation for machine vision inference model
    let cv_confidence = 0.5;
    let cv_uncertainty = "UNCERTAIN";
    let dog_count = report.dog_count || 1;
    const detected_tags = new Set(report.context_tags || []);

    // Text & Keyword Context Analysis
    if (description.includes("pack") || description.includes("group") || description.includes("dogs") || description.includes("multiple")) {
      dog_count = Math.max(dog_count, 3);
      detected_tags.add("group_presence");
    }

    if (description.includes("bite") || description.includes("bitten") || description.includes("blood") || description.includes("injury")) {
      detected_tags.add("contact_bite");
    }

    if (description.includes("garbage") || description.includes("dump") || description.includes("meat") || description.includes("waste")) {
      detected_tags.add("near_waste");
    }

    if (description.includes("school") || description.includes("college") || description.includes("iilm") || description.includes("campus")) {
      detected_tags.add("near_school");
    }

    if (description.includes("hospital") || description.includes("gims") || description.includes("sharda") || description.includes("kailash")) {
      detected_tags.add("near_hospital");
    }

    if (description.includes("evening") || description.includes("night") || description.includes("8 pm") || description.includes("dark")) {
      detected_tags.add("evening");
    }

    // Photo Verification & Confidence Scoring
    if (hasPhoto) {
      cv_confidence = 0.92;
      cv_uncertainty = "CONFIRMED";
    } else if (description.length > 30) {
      cv_confidence = 0.78;
      cv_uncertainty = "PROBABLE";
    } else if (description.length < 10) {
      cv_confidence = 0.20;
      cv_uncertainty = "REJECTED"; // Reject low effort spam without photo or text
    }

    const updates = {
      cv_confidence,
      cv_uncertainty,
      dog_count,
      context_tags: Array.from(detected_tags),
      cv_status: "processed",
      verification_status: cv_uncertainty === "REJECTED" ? "rejected" : (cv_uncertainty === "CONFIRMED" ? "verified" : "pending"),
      status: cv_uncertainty === "REJECTED" ? "rejected" : (cv_uncertainty === "CONFIRMED" ? "verified" : "under_review"),
      updated_at: new Date().toISOString()
    };

    console.log(`[AI Worker] Results for ${report.id}: Confidence=${(cv_confidence * 100).toFixed(0)}% | Tier=${cv_uncertainty} | Status=${updates.status}`);
    
    return updates;
  },

  /**
   * Batch process all unverified or pending reports in queue
   */
  async processPendingBatch(reportsQueue = []) {
    console.log(`[AI Worker] Batch processing ${reportsQueue.length} pending reports...`);
    const results = [];
    for (const report of reportsQueue) {
      const updateData = await this.processReport(report);
      results.push({ ...report, ...updateData });
    }
    return results;
  }
};
