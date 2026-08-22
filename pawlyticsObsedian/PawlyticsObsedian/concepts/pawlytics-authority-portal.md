---
title: "Pawlytics Authority Portal & Control System"
type: concept
created: 2026-08-23
updated: 2026-08-23
tags: [pawlytics, authority-dashboard, municipal-control, settings]
sources:
  - "[[2026-08-23-pawlytics-architecture-overview]]"
---

# Pawlytics Authority Portal

The **Authority Portal** (`/authority`) provides municipal officers, field dispatchers, and veterinary coordinators with a real-time conflict intelligence suite for managing stray dog populations and bite incidents.

## Key Sub-Modules
- **Overview & Map**: Spatial heatmap and real-time incident feed.
- **Verification Queue**: Triage interface for approving field reports.
- **Wards & Hotspots**: Dynamic risk scoring per sector.
- **Authority Settings (`/authority/settings`)**:
  - **General Profile**: Municipality contact & emergency hotline.
  - **Team Management**: Staff roles (Super Admin, Field Dispatcher, Vet Coordinator, Field Officer).
  - **Escalation Rules**: 24h bite thresholds and citizen broadcast radii.
  - **Data Retention & Exports**: GeoJSON, CSV, and official PDF audit reports.
  - **Infrastructure**: Supabase cloud & MCP Server integration status.

## Linked Entities & Concepts
- [[pawlytics-platform]]
- [[llm-wiki-pattern]]
