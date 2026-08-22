/**
 * Pawlytics Confidence Calibration Engine
 * Temperature Scaling (T=1.25) & Platt Scaling Probability Alignment
 */

const TEMPERATURE = 1.25;

/** Apply Temperature Scaling to calibrate raw neural confidence logits */
export function calibrateConfidence(rawConfidence) {
  if (rawConfidence <= 0 || rawConfidence >= 1) return rawConfidence;

  // Convert probability to logit
  const logit = Math.log(rawConfidence / (1 - rawConfidence));
  
  // Apply Temperature Scaling (T = 1.25)
  const scaledLogit = logit / TEMPERATURE;

  // Sigmoid back to calibrated probability
  const calibrated = 1 / (1 + Math.exp(-scaledLogit));
  return Math.round(calibrated * 100) / 100;
}
