/**
 * Pawlytics Active Learning & Model Telemetry Ledger
 * Collects prediction logs, confidence ratings, and human corrections for future dataset training.
 */

const ACTIVE_LEARNING_KEY = "pawlytics_active_learning_ledger";

/** Log a model prediction event to telemetry ledger */
export function logCvPredictionEvent(predictionData) {
  try {
    const existing = getActiveLearningLedger();
    const event = {
      id: `telemetry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      model_name: predictionData.metadata?.model_name || "Pawlytics-YOLOv8-DualStage",
      model_version: predictionData.metadata?.model_version || "2.4.0",
      predicted_count: predictionData.dogCount,
      confidence: predictionData.confidence,
      uncertainty_tier: predictionData.uncertaintyTier,
      input_quality_passed: predictionData.metadata?.input_quality_passed ?? true,
      quality_metrics: predictionData.qualityMetrics || {},
      human_correction: null, // Populated when moderator corrects in queue
      status: "unverified",
    };

    existing.unshift(event);
    // Keep last 100 telemetry events
    const trimmed = existing.slice(0, 100);
    localStorage.setItem(ACTIVE_LEARNING_KEY, JSON.stringify(trimmed));
    return event;
  } catch (err) {
    console.warn("Active learning telemetry log error:", err);
    return null;
  }
}

/** Record a human-in-the-loop correction from Authority Queue */
export function recordHumanCorrection(eventId, correctedClass, correctedCount, reviewerId = "admin-1") {
  try {
    const existing = getActiveLearningLedger();
    const target = existing.find((e) => e.id === eventId);

    if (target) {
      target.human_correction = {
        corrected_class: correctedClass,
        corrected_count: correctedCount,
        reviewer_id: reviewerId,
        reviewed_at: new Date().toISOString(),
      };
      target.status = "corrected_for_training";
      localStorage.setItem(ACTIVE_LEARNING_KEY, JSON.stringify(existing));
    }
    return target;
  } catch (err) {
    console.warn("Active learning correction error:", err);
    return null;
  }
}

/** Retrieve active learning ledger entries */
export function getActiveLearningLedger() {
  try {
    const raw = localStorage.getItem(ACTIVE_LEARNING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
