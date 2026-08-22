# 🐾 Pawlytics — Master USP, Feature & Navigation Directory

> **Core Tagline**: *"We do not map dogs. We map risk — ward by ward, route by route, report by report."*

Pawlytics is an enterprise-grade, SIH 2026 gold-standard Web App & PWA platform for human–stray animal conflict intelligence, municipal risk analytics, AI computer vision incident verification, and Supreme Court ABC compliance management.

---

## 🌟 Key USPs (Unique Selling Propositions)

### 1. 🧠 Multi-Stage Neural Vision AI Engine (`YOLOv8/v11 ONNX`)
- **Stage 0 Quality Gate**: Pre-filters image blur (Laplacian variance), exposure, and resolution.
- **Stage 1 Primary Detector**: Real-time YOLOv8/v11 ONNX detection for candidate proposals.
- **Stage 2 Species & Artifact Disambiguator**: Rejects false positives (horses, cows, cats, ceiling lights) as `0 dogs`, while accurately detecting dogs photographed off laptop/phone displays (`is_screen_photo`).
- **Pack Sub-Grid De-Clustering**: Automatically segments dense canine group photos into individual bounding boxes for **Dog #1, Dog #2 ... Dog #7**.
- **Temporal Multi-Frame Voting**: $K=5$ frame sliding window buffer requiring $\ge 60\%$ consensus for video/camera feeds.

### 2. 🛤️ Route-Aware Conflict Exposure Engine ("Know Before You Go")
- Calculates route-specific conflict exposure scores ($0 - 100$) by intersecting candidate travel paths with active spatial risk zones and historical bite report clusters.
- Recommends lower-exposure alternate routes for pedestrians, morning walkers, and school commutes.

### 3. ⚖️ Explainable Composite Risk Engine & Real DBSCAN Clustering
- **Deterministic & Auditable**: Time-decayed weighted risk scoring (Bite severity, group presence, waste site proximity, night concentration).
- **Spatial Clustering**: Real DBSCAN spatial clustering engine ($\epsilon = 250\text{m}$, $\text{minPts} = 3$) to merge report coordinates into active hotspot polygons.
- **Risk Isolation**: Low-confidence or unverified computer vision detections cannot single-handedly inflate ward risk scores.

### 4. 🏥 24/7 ARV Emergency First-Aid & Facility Linkage
- 15-minute Rabies Post-Exposure Prophylaxis (PEP) first-aid guidance.
- Direct phone hotlines and distance calculations to government Anti-Rabies Vaccine (ARV) centers and Rabies Immunoglobulin (RIG) emergency clinics.

### 5. 📄 1-Click Executive PDF Compliance Exporter
- Generates official, municipality-ready PDF reports with report statistics, severity distribution, hotspot summaries, and regulatory compliance disclaimers.

### 6. ✂️ Municipal ABC Sterilization & ARV Vaccination Ledger
- SC Mandate (Nov 7, 2025) compliant ledger for logging ear-notch tags (`NOIDA-62-041`), ARV vaccination dates, 365-day booster warnings, and humane release locations.

### 7. 🎙️ Multilingual Voice Incident Reporting (Speech-to-Text)
- Supports spoken Hindi (हिंदी), English, and Marathi (मराठी). Converts spoken sentences into structured report fields (`category`, `dog_count`, `severity_level`, `description`).

### 8. 📡 Real-Time Supabase WebSocket & Offline-First Sync
- Real-time emergency toast alerts on Level 4/5 bite reports.
- Automatic background sync when cellular connectivity is restored (`navigator.onLine === false`).

---

## 🗺️ Complete Navigation & Access Guide

### 📱 Citizen PWA Routes

| Feature Name | URL Route | How to Access in UI | Feature Description |
| :--- | :--- | :--- | :--- |
| **Citizen Home** | `/` | Bottom Nav $\rightarrow$ **Home** | Overview of ward risk status, quick report trigger, and ARV emergency modal button. |
| **24/7 ARV Emergency Modal** | `/` or `/map` | Click **"ARV Centers"** button | 15-min Rabies PEP guide & direct dial to nearby 24/7 ARV hospitals (`0120-2522176`). |
| **Live Citizen Risk Map** | `/map` | Bottom Nav $\rightarrow$ **Map** | Interactive Leaflet map displaying active conflict hotspots, ward boundaries, and verified pings. |
| **AI Camera & Voice Report Wizard** | `/report` | Click **"+" (Report)** button | 5-step wizard featuring Multilingual Voice Input (Step 1) and YOLO Live Camera Scanner (Step 5). |
| **Route Check ("Know Before You Go")** | `/routes` | Bottom Nav $\rightarrow$ **Routes** | Select From & To locations to compare path exposure scores (e.g. Route A 72/100 vs Route B 38/100). |
| **My Submitted Reports** | `/my-reports` | Bottom Nav $\rightarrow$ **Mine** | Tracking timeline for submitted citizen reports, moderation status, and verification badges. |
| **Safety & First-Aid Guide** | `/safety` | Sidebar $\rightarrow$ **Safety** | Canine body language guides, de-escalation tips, and rabies prevention protocols. |

---

### 🏛️ Municipal Authority Dashboard Routes

| Feature Name | URL Route | How to Access in UI | Feature Description |
| :--- | :--- | :--- | :--- |
| **Authority Overview** | `/authority` | Authority Sidebar $\rightarrow$ **Overview** | Municipal control room overview, total reports, active hotspots, and escalation flags. |
| **Authority Risk Map** | `/authority/map` | Authority Sidebar $\rightarrow$ **Live Risk Map** | Control room GIS map with layer toggles (Hotspots, Reports, Wards, ARV Centers). |
| **All Reports Table** | `/authority/reports` | Authority Sidebar $\rightarrow$ **Reports** | Searchable table of all submitted citizen reports with CSV/JSON export filters. |
| **Human-in-the-Loop Verification Queue** | `/authority/queue` | Authority Sidebar $\rightarrow$ **Verification Queue** | Reviewer moderation queue for verifying/rejecting reports and logging active learning corrections. |
| **Hotspot Management** | `/authority/hotspots` | Authority Sidebar $\rightarrow$ **Hotspots** | DBSCAN spatial clusters, risk scores, and action dispatch tracking. |
| **Sectors & Wards Directory** | `/authority/wards` | Authority Sidebar $\rightarrow$ **Wards / Sectors** | Sector-by-sector risk scores, population density, and verified incident counts. |
| **Analytics & National Heatmap** | `/authority/analytics` | Authority Sidebar $\rightarrow$ **Analytics** | Ward analytics, contextual radar charts, and **National Conflict Load (37.15L 2024 dataset)** heatmap. |
| **Municipal Action Tracking** | `/authority/actions` | Authority Sidebar $\rightarrow$ **Actions** | Dispatch municipal teams for ABC sterilization, ARV vaccination, or aggressive pack containment. |
| **Compliance PDF Exporter** | `/authority/compliance` | Authority Sidebar $\rightarrow$ **Compliance Reports** | Executive compliance summary with **"Print / Save Official PDF"** button. |
| **ABC Sterilization & ARV Ledger** | `/authority/abc-campaigns` | Authority Sidebar $\rightarrow$ **ABC Sterilization** | SC Mandate ear-notch tagging ledger (`Tag #NOIDA-62-041`), booster warnings, and vet release tracking. |
| **GIS Data Layers** | `/authority/layers` | Authority Sidebar $\rightarrow$ **Data Layers** | Manage spatial geojson layers, land-use zones, and waste dump overlays. |
| **System Settings** | `/authority/settings` | Authority Sidebar $\rightarrow$ **Settings** | 5-tab settings console: General, Escalation, Team, Data Export, and System Diagnostics. |

---

## 🛠️ Technical Stack Summary

- **Frontend Core**: React 18, Vite 6, Tailwind CSS, Lucide React Icons, Canvas API.
- **Computer Vision**: TensorFlow.js COCO-SSD + YOLOv8/v11 ONNX engine, Image Quality Gate (Laplacian variance), 2-Stage Classifier, Temporal Sliding Window.
- **Backend & Database**: Supabase PostgreSQL, RLS Security Policies, WebSocket Realtime Broadcast.
- **Spatial Analytics**: Leaflet GIS, DBSCAN Clustering ($\epsilon=250\text{m}$), Route Segment Risk Intersection.
