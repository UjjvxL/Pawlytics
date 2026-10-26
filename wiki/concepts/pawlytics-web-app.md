---
title: "Pawlytics Web Application"
type: concept
created: 2026-08-23
updated: 2026-08-23
tags: [pawlytics, web-app, overview, react, vite]
sources:
  - "[[pawlytics-architecture-and-progress]]"
---

# Pawlytics Web Application

The **Pawlytics Web Application** is a full-stack stray animal analytics, incident management, and spatial-temporal risk intelligence platform. It bridges the gap between public citizen safety reporting and municipal action planning.

## Key System Pillars

1. **Role-Based Portals**:
   - [[citizen-portal|Citizen Portal]]: Public reporting, danger map navigation, safe route finding, and safety education.
   - [[authority-portal|Authority Portal]]: Command center overview, incident verification, hotspot analytics, ward administration, field team dispatch, and audit compliance reporting.
2. **Backend & Data Integration**:
   - Powered by [[supabase-backend-service|Supabase PostgreSQL]] for auth, database, row-level security, and real-time data broadcasting.
3. **Core Intelligence & Safety Algorithms**:
   - Powered by the [[risk-engine|Risk Engine]], computer vision quality gates (`yoloDetector.js`, `imageQualityGate.js`), and spatial clustering (`spatialClustering.js`).

## Application Tech Stack
- **Frontend Core**: React 18, Vite, React Router DOM v6.
- **UI & Styling**: Tailwind CSS, Radix UI primitives, Lucide Icons, Framer Motion.
- **Mapping & Data Visualization**: React Leaflet, Recharts.
- **Document & PDF Generation**: `jsPDF`, `html2canvas`.
- **Backend Services**: Supabase JS SDK, PostgreSQL, Supabase Auth & Realtime.

## Related Concepts & Entities
- [[pawlytics-project]]
- [[citizen-portal]]
- [[authority-portal]]
- [[risk-engine]]
- [[supabase-backend-service]]
