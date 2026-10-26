---
title: "Risk Engine & Intelligence System"
type: concept
created: 2026-08-23
updated: 2026-08-23
tags: [pawlytics, risk-engine, computer-vision, spatial-clustering, active-learning]
sources:
  - "[[pawlytics-architecture-and-progress]]"
---

# Risk Engine & Intelligence System

The **Risk Engine & Intelligence Subsystem** in [[pawlytics-web-app|Pawlytics]] provides explainable multi-factor risk scoring, computer vision incident validation, and spatial-temporal cluster analysis.

## Core Modules (`src/lib/`)

### 1. Composite Risk Engine (`riskEngine.js`)
Calculates composite risk scores for municipal wards and geographical clusters based on:
- **Incident Frequency & Recency**: Exponential time decay applied to past reports.
- **Aggression Index**: Weighted calculation of bite severity, aggressive behavior, and child/elderly vulnerability.
- **Pack Density**: Pack size multipliers (larger packs increase collision risk exponentially).
- **Sterilization / Vaccination Deficit**: Inverted ratio of unsterilized strays in the ward.

### 2. Computer Vision & Validation Pipeline
- `imageQualityGate.js`: Edge check evaluating blur, illumination, and contrast before server upload.
- `yoloDetector.js` & `twoStageClassifier.js`: Object detection pipeline identifying dogs, pack presence, and species verification.
- `geminiValidator.js`: Secondary multimodal AI validation for complex or ambiguous report images.
- `confidenceCalibration.js`: Dynamic threshold adjustment based on historical verification precision.

### 3. Spatial & Temporal Intelligence
- `spatialClustering.js`: DBSCAN and density-based clustering identifying emerging hot zones across geographical coordinates.
- `temporalTracker.js`: Tracks nocturnal vs. diurnal incident shifts to optimize patrol timing.
- `activeLearning.js`: Feedback loop incorporating authority verification outcomes to refine risk weights and vision classifiers.

## Related Concepts
- [[pawlytics-web-app]]
- [[authority-portal]]
- [[citizen-portal]]
