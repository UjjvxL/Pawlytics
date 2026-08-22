# Pawlytics Platform Architecture & Authority Settings Release

## Overview
Pawlytics is a stray animal analytics, incident reporting, and conflict intelligence platform built with React 18, Vite 6, Tailwind CSS 3.4, and Supabase.

## Core Portals
1. **Citizen Portal (`/`)**:
   - `CitizenHome`: Emergency report triggers and quick status.
   - `LiveMap`: Heatmap and incident map with Leaflet.
   - `ReportIncident`: Multi-step incident reporting wizard.
   - `RouteCheck`: Path safety scoring and safer navigation routes.
   - `SafetyGuide`: Rabies prevention and dog behavior guides.

2. **Authority Portal (`/authority`)**:
   - `AuthorityOverview`: Key metrics, total incidents, verified bites, and ward risk distribution.
   - `ReportsPage`: Comprehensive filterable incident table.
   - `VerificationQueue`: Triage queue for field officers.
   - `HotspotsPage`: High-density cluster analysis.
   - `WardsPage`: Sector-by-sector risk calculation.
   - `AnalyticsPage`: Trend graphs and monthly incident distribution.
   - `ActionsPage`: Sterilization & vaccination campaign tracking.
   - `ComplianceReport`: Municipal regulatory compliance reporting.
   - `DataLayers`: GIS layer controls.
   - `SettingsPage`: Full municipal settings, staff role management, 24h escalation thresholds, citizen broadcast radii, and data export (GeoJSON/CSV/PDF).
