---
title: "Authority Portal"
type: concept
created: 2026-08-23
updated: 2026-08-23
tags: [pawlytics, authority-portal, municipal, analytics, verification, compliance]
sources:
  - "[[pawlytics-architecture-and-progress]]"
---

# Authority Portal

The **Authority Portal** is the tactical decision-making and operational management hub in [[pawlytics-web-app|Pawlytics]] for municipal animal control officers, ward representatives, and emergency responders.

## Key Subsystems & Views

1. **Executive Command Center (`AuthorityOverview.jsx`)**: Real-time KPI cards (open incidents, high-risk wards, active dispatches, response times) and urgent alert banners.
2. **Tactical Geospatial Map (`AuthorityMap.jsx`)**: Comprehensive map featuring ward boundary overlays, incident heatmaps, sterilization drive markers, and filter controls.
3. **AI Verification Queue (`VerificationQueue.jsx`)**: Triage panel for reviewing citizen reports. Integrates AI confidence scores, image quality metrics, and one-click verification/rejection.
4. **Hotspots & Analytics (`HotspotsPage.jsx`, `AnalyticsPage.jsx`)**: Recharts visualizations for monthly incident trends, aggression intensity distribution, and spatial hotspot rankings computed by the [[risk-engine|Risk Engine]].
5. **Action Dispatch System (`ActionsPage.jsx`)**: Coordination tool for assigning field teams to sterilizations, vaccinations, aggressive pack interventions, and rescues.
6. **Ward Governance (`WardsPage.jsx`)**: Administrative dashboard for tracking ward-level safety scores, complaint resolution rates, and budget allocation.
7. **Compliance & Legal PDF Generator (`ComplianceReport.jsx`)**: Automated audit report builder generating statutory compliance reports exported via `jsPDF` and `html2canvas`.
8. **National Overview (`NationalConflictHeatmap.jsx`)**: High-level macro view of nationwide stray animal conflict density.

## Related Concepts
- [[pawlytics-web-app]]
- [[risk-engine]]
- [[supabase-backend-service]]
- [[citizen-portal]]
