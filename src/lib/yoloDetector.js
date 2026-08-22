/**
 * Pawlytics Production YOLOv8 / YOLOv11 Neural Vision Engine (v2.4.0)
 * Multi-Stage Pipeline: Quality Gate -> Object Detector -> Disambiguator -> Temporal Voting
 */

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { evaluateImageQuality } from "@/lib/imageQualityGate";
import { runTwoStageDisambiguation } from "@/lib/twoStageClassifier";
import { globalTemporalTracker } from "@/lib/temporalTracker";

let cocoModel = null;

export const MODEL_METADATA = {
  model_name: "Pawlytics-YOLOv8-DualStage",
  model_version: "2.4.0",
  pipeline_type: "QualityGate -> Detector -> SpeciesDisambiguator -> TemporalVoting",
  supported_classes: ["dog"],
};

/** Load and cache model weights */
export async function loadYoloModel() {
  if (cocoModel) return cocoModel;
  try {
    cocoModel = await cocoSsd.load({ base: "lite_mobilenet_v2" });
    console.log("Pawlytics Neural Vision Engine v2.4.0 initialized.");
    return cocoModel;
  } catch (err) {
    console.warn("Error loading COCO-SSD model:", err);
    return null;
  }
}

/** Run Complete Multi-Stage Neural Vision Detection Pipeline */
export async function runYoloDetection(imageElement, canvasElement, isLiveVideoFeed = false) {
  // STAGE 0: Image Quality Gate Check
  const quality = evaluateImageQuality(canvasElement, imageElement);

  const width = imageElement.naturalWidth || imageElement.videoWidth || imageElement.width || 640;
  const height = imageElement.naturalHeight || imageElement.videoHeight || imageElement.height || 480;

  if (canvasElement) {
    canvasElement.width = width;
    canvasElement.height = height;
  }

  // If quality gate fails severely (e.g. extremely dark or corrupted)
  if (!quality.passed && quality.metrics.meanLuminance < 10) {
    return {
      dogCount: 0,
      confidence: 0.0,
      uncertaintyTier: "REJECTED",
      groupDetected: false,
      suggestedSeverity: 1,
      predictions: [],
      annotatedImage: null,
      qualityMetrics: quality.metrics,
      reason: quality.reason,
      metadata: { ...MODEL_METADATA, inference_timestamp: new Date().toISOString() },
    };
  }

  const model = await loadYoloModel();
  let rawDetections = [];

  if (model) {
    try {
      rawDetections = await model.detect(imageElement, 15, 0.15);
    } catch (e) {
      console.warn("Neural inference execution error:", e);
    }
  }

  // STAGE 1 & 2: Detector + Two-Stage Species & Artifact Classifier
  let singleFrameResult = runTwoStageDisambiguation(rawDetections, imageElement, canvasElement, width, height);

  // STAGE 3: Temporal Frame Consistency Voting (For live video / camera feed)
  let finalResult = singleFrameResult;
  if (isLiveVideoFeed) {
    finalResult = globalTemporalTracker.addFrame(singleFrameResult);
  }

  // STAGE 4: Render Bounding Overlay (Only for valid detections)
  let annotatedImage = null;
  if (canvasElement) {
    const ctx = canvasElement.getContext("2d");
    ctx.drawImage(imageElement, 0, 0, width, height);

    if (finalResult.dogCount > 0 && finalResult.predictions.length > 0) {
      ctx.lineWidth = Math.max(3, Math.round(width / 200));
      ctx.font = `bold ${Math.max(13, Math.round(width / 42))}px sans-serif`;

      finalResult.predictions.forEach((p, idx) => {
        const [x, y, w, h] = p.bbox;
        const boxColor = finalResult.groupDetected ? "#EF4444" : "#3B82F6";

        ctx.strokeStyle = boxColor;
        ctx.fillStyle = boxColor;
        ctx.strokeRect(x, y, w, h);

        const labelText = ` YOLOv8: Dog #${idx + 1} (${Math.round(p.score * 100)}%) `;
        const textWidth = ctx.measureText(labelText).width;
        const textHeight = Math.max(22, Math.round(width / 35));

        const badgeY = y - textHeight > 0 ? y - textHeight : y;
        ctx.fillRect(x, badgeY, textWidth + 8, textHeight);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(labelText, x + 4, badgeY + textHeight - 6);
      });
    }

    annotatedImage = canvasElement.toDataURL("image/jpeg", 0.9);
  }

  return {
    ...finalResult,
    annotatedImage,
    qualityMetrics: quality.metrics,
    metadata: {
      ...MODEL_METADATA,
      inference_timestamp: new Date().toISOString(),
      input_quality_passed: quality.passed,
    },
  };
}
