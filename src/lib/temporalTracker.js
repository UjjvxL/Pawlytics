/**
 * Pawlytics Temporal Multi-Frame Tracker & Voting Engine
 * Aggregates predictions across K=5 consecutive frames to prevent single-frame flickering or instant false detections.
 */

class TemporalTracker {
  constructor(windowSize = 5) {
    this.windowSize = windowSize;
    this.frameBuffer = [];
  }

  /** Reset temporal frame buffer */
  reset() {
    this.frameBuffer = [];
  }

  /** Add a single frame detection result to the temporal sliding window */
  addFrame(frameResult) {
    this.frameBuffer.push(frameResult);
    if (this.frameBuffer.length > this.windowSize) {
      this.frameBuffer.shift();
    }
    return this.evaluateTemporalVoting();
  }

  /** Evaluate majority voting across temporal window */
  evaluateTemporalVoting() {
    if (this.frameBuffer.length === 0) {
      return { dogCount: 0, uncertaintyTier: "CONFIRMED", confidence: 0.95 };
    }

    // Count occurrences of predictions
    const dogCountCounts = {};
    let totalConfidence = 0;

    this.frameBuffer.forEach((frame) => {
      const cnt = frame.dogCount || 0;
      dogCountCounts[cnt] = (dogCountCounts[cnt] || 0) + 1;
      totalConfidence += frame.confidence || 0.85;
    });

    // Find majority mode count
    let majorityCount = 0;
    let maxVotes = 0;

    Object.entries(dogCountCounts).forEach(([cntStr, votes]) => {
      const cnt = parseInt(cntStr, 10);
      if (votes > maxVotes) {
        maxVotes = votes;
        majorityCount = cnt;
      }
    });

    const avgConfidence = totalConfidence / this.frameBuffer.length;
    const voteRatio = maxVotes / this.frameBuffer.length;

    // Temporal Consistency Verification: Require at least 60% agreement across frames
    let uncertaintyTier = "CONFIRMED";
    if (voteRatio < 0.60) {
      uncertaintyTier = "UNCERTAIN";
    } else if (avgConfidence < 0.70) {
      uncertaintyTier = "PROBABLE";
    }

    // Return current consensus frame
    const latestFrame = this.frameBuffer[this.frameBuffer.length - 1];

    return {
      ...latestFrame,
      dogCount: majorityCount,
      confidence: Math.round(avgConfidence * 100) / 100,
      uncertaintyTier,
      temporalConsistency: `${maxVotes}/${this.frameBuffer.length} frames agreed`,
      isTemporallyStable: voteRatio >= 0.60,
    };
  }
}

export const globalTemporalTracker = new TemporalTracker(5);
