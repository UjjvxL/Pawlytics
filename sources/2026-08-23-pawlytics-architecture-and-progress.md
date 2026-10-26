# Pawlytics Web Application — Full Architecture & Development Progress Report

**Date**: 2026-08-23
**System**: Pawlytics — Stray Animal Analytics & Conflict Intelligence Platform
**Tech Stack**: React 18, Vite, Tailwind CSS, Supabase PostgreSQL, Leaflet, Recharts, Framer Motion, Radix UI.

---

## 1. Executive Summary

Pawlytics is a full-stack stray animal conflict intelligence, incident tracking, and risk analytics web application designed for municipal authorities, field workers, and citizens. It combines real-time citizen reporting, spatial-temporal risk modeling, computer vision photo validation, and municipal compliance reporting.

---

## 2. Core Architecture & Backend Layer

- **Supabase Integration**: Migrated from legacy Base44 backend to pure Supabase (`@supabase/supabase-js`).
- **Database Schema (`supabase/migrations/001_initial_pawlytics_schema.sql`)**:
  - `profiles`: User accounts with role-based metadata (`citizen`, `authority`, `admin`).
  - `reports`: Stray animal incident reports with location coordinates, severity, tags, verification status, and media attachments.
  - `hotspots`: Calculated high-risk spatial clusters and risk scores.
  - `wards`: Municipal administrative boundaries and ward analytics.
  - `actions`: Field team dispatches, sterilizations, vaccination drives, and response actions.
- **Service Layer (`src/api/services/`)**:
  - `auth.js`: User authentication, session management, role retrieval, password reset flows.
  - `reports.js`: CRUD operations for incident reports, verification flow, filtering.
  - `hotspots.js`: Geospatial hotspot data retrieval and analytics.

---

## 3. Intelligence & Engineering Subsystems (`src/lib/`)

- **Composite Risk Engine (`riskEngine.js`)**: Computes explainable risk scores for municipal wards and geographical clusters using multi-factor indicators (incident density, severity index, aggressive pack behavior, temporal recency, pack size).
- **Computer Vision & Quality Gate (`yoloDetector.js`, `twoStageClassifier.js`, `imageQualityGate.js`, `geminiValidator.js`, `visionEngine.js`)**:
  - Validates submitted incident images for blur, lighting, dog presence, and species classification.
  - Two-stage classification pipeline for incident verification.
- **Spatial & Temporal Analytics (`spatialClustering.js`, `temporalTracker.js`, `activeLearning.js`, `confidenceCalibration.js`)**:
  - DBSCAN/K-Means spatial clustering for identifying emerging stray pack hot zones.
  - Temporal tracking for shift dynamics (day vs night pack behavior).
  - Active learning loop for continuous model calibration based on authority verification feedback.
- **Realtime & Offline Capabilities (`realtimeBroadcast.js`, `offlineSync.js`)**:
  - Supabase Realtime channel subscriptions for instant incident alert broadcasts.
  - IndexedDB-backed offline queue for field workers reporting in poor connectivity areas.

---

## 4. Frontend Application Structure & Portals

### A. Authentication & Access Control
- `RoleRoute.jsx`: Protected routes enforcing role authorization.
- `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `OAuthConsent.jsx`.

### B. Citizen Portal (`src/pages/citizen/`)
- `CitizenHome.jsx`: Overview dashboard with quick actions and emergency hotlines.
- `ReportIncident.jsx`: Multi-step incident reporting wizard with location pin, dog count, aggression level, and photo upload.
- `MyReports.jsx`: Citizen personal incident history and status tracker.
- `LiveMap.jsx`: Interactive Leaflet map showing public safety markers, incidents, and danger zones.
- `RouteCheck.jsx`: Safe walking route planner avoiding high-risk stray pack areas.
- `SafetyGuide.jsx`: Educational resources on stray dog interaction, bite protocol, and rabies safety.

### C. Authority & Municipal Portal (`src/pages/authority/`)
- `AuthorityOverview.jsx`: Strategic control center with incident counters, active alerts, and ward metrics.
- `AuthorityMap.jsx`: Tactical map with layer controls (incident density, sterilization coverage, ward boundaries).
- `VerificationQueue.jsx`: Review flow for verifying citizen reports with image quality checks and AI confidence scores.
- `HotspotsPage.jsx`: Interactive hotspot management and risk ranking dashboard.
- `AnalyticsPage.jsx`: In-depth Recharts analytical views (time series, aggression distribution, response time benchmarks).
- `ActionsPage.jsx`: Field team dispatch management (sterilization, vaccination, rescue operations).
- `WardsPage.jsx`: Municipal ward governance and resource allocation.
- `ComplianceReport.jsx`: Legal & statutory compliance generator exporting audit-ready PDFs via `jsPDF` & `html2canvas`.
- `DataLayers.jsx`: Map overlay toggle management.
- `NationalConflictHeatmap.jsx`: High-level national-scale conflict density heatmap.
- `PAWLYTICS_MASTER_USP_PRESENTATION.html`: Interactive executive deck presenting Pawlytics' Unique Selling Proposition.
