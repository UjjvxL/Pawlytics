---
title: "Pawlytics Web Application — Architecture & Progress Report"
type: source
created: 2026-08-23
updated: 2026-08-23
tags: [pawlytics, architecture, web-app, supabase, react, progress-report]
sources:
  - "[[2026-08-23-pawlytics-architecture-and-progress]]"
---

# Source Summary: Pawlytics Web Application Architecture & Progress

- **Source Document**: [[2026-08-23-pawlytics-architecture-and-progress]]
- **Subject**: Technical progress, frontend portals, backend schema, intelligence engines, and feature status of the [[pawlytics-project|Pawlytics]] platform.

## Key Architectural Highlights

1. **Full-Stack Stack & Migration**: Transitioned from Base44 to [[supabase-backend-service|Supabase]] with custom service abstractions (`src/api/services/`), PostgreSQL RLS policies, and real-time event broadcasting.
2. **Dual-Portal System**:
   - [[citizen-portal|Citizen Portal]]: Public reporting, live maps, safe route checking, and safety guides.
   - [[authority-portal|Authority Portal]]: Command center overview, AI-assisted verification queue, ward risk analytics, field action dispatches, and automated compliance PDF exports.
3. **Advanced Intelligence Subsystems**:
   - [[risk-engine|Risk Engine & AI Pipelines]]: Explainable multi-factor spatial-temporal risk scoring, DBSCAN spatial clustering, active learning, and computer vision quality gates (`yoloDetector.js`, `imageQualityGate.js`, `geminiValidator.js`).
4. **PWA & Field Readiness**: IndexedDB-backed offline report queuing and real-time socket updates for field teams operating in low-connectivity areas.

## Connected Pages
- [[pawlytics-project]]
- [[pawlytics-web-app]]
- [[citizen-portal]]
- [[authority-portal]]
- [[risk-engine]]
- [[supabase-backend-service]]
