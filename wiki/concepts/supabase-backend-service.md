---
title: "Supabase Backend Service Layer"
type: concept
created: 2026-08-23
updated: 2026-08-23
tags: [pawlytics, supabase, database, postgresql, authentication, offline-sync]
sources:
  - "[[pawlytics-architecture-and-progress]]"
---

# Supabase Backend Service Layer

The **Supabase Backend Service Layer** forms the persistence, authentication, real-time, and row-level security foundation of the [[pawlytics-web-app|Pawlytics]] application.

## Database & Schema (`supabase/migrations/001_initial_pawlytics_schema.sql`)

- `profiles`: User account details, contact info, and role assignments (`citizen`, `authority`, `admin`).
- `reports`: Primary incident records storing geotagged coordinates (`latitude`, `longitude`), aggression level, dog count, status (`pending`, `verified`, `resolved`), and image URLs.
- `hotspots`: Aggregated high-risk spatial clusters computed periodically by the [[risk-engine|Risk Engine]].
- `wards`: Municipal administrative zones with demographic data, safe score ratings, and assigned officers.
- `actions`: Field dispatches, ABC (Animal Birth Control) sterilizations, anti-rabies drives, and rescue logs.

## Modular API Services (`src/api/services/`)

- `auth.js`: Wraps Supabase Auth (`signUp`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`).
- `reports.js`: Provides fetching, creation, status updating, and filtering for incident reports.
- `hotspots.js`: Exposes spatial cluster queries and ward-level risk rankings.
- `index.js`: Exports all service modules under a clean unified interface.

## Realtime & Offline Capabilities (`src/lib/`)
- `realtimeBroadcast.js`: Manages real-time Supabase web sockets for instantaneous notification of new high-severity reports to authority dashboards.
- `offlineSync.js`: IndexedDB offline storage layer enabling field workers to log reports offline and auto-sync when network connection is restored.

## Related Concepts
- [[pawlytics-web-app]]
- [[authority-portal]]
- [[citizen-portal]]
