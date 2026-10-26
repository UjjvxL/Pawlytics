---
title: "Citizen Portal"
type: concept
created: 2026-08-23
updated: 2026-08-23
tags: [pawlytics, citizen-portal, public-safety, leaflet, reporting]
sources:
  - "[[pawlytics-architecture-and-progress]]"
---

# Citizen Portal

The **Citizen Portal** in [[pawlytics-web-app|Pawlytics]] provides a seamless, mobile-responsive web interface for everyday citizens to report stray animal incidents, inspect live safety maps, check safe routes, and access emergency resources.

## Core Features & Pages

- **Home Dashboard (`CitizenHome.jsx`)**: Main landing experience with quick incident reporting triggers, active alerts in the area, emergency hotlines, and a **Multilingual Voice Assistant shortcut card**.
- **Incident Reporting Wizard (`ReportIncident.jsx`)**: Step-by-step reporting workflow capturing geotagged coordinates, pack count, aggression levels, media uploads, and AI image validation.
- **Multilingual Voice Assistant (`VoiceReportInput.jsx`)**: Integrated browser SpeechRecognition component supporting Hindi (hi-IN), English (en-IN), and Marathi (mr-IN). Automatically parses spoken phrases ("3 dogs barking near park", "काटा") into dog counts, severity levels, and category tags with error handling for mic permissions.
- **Photo & Video Gallery Upload (`CameraVisionModal.jsx`)**: Dual-mode media scanner allowing live camera snapshots OR direct file upload from local device storage / photo gallery (`image/*`, `video/*`). Videos extract keyframes for real-time YOLO canine detection, bounding box overlay rendering, and confidence scoring.
- **My Reports Tracker (`MyReports.jsx`)**: Personal history view showing status updates (Submitted -> In Verification -> Field Team Dispatched -> Resolved).
- **Live Safety Map (`LiveMap.jsx`)**: Interactive Leaflet map displaying active incident clusters, recent aggression markers, and danger zones.
- **Safe Route Checker (`RouteCheck.jsx`)**: Utility allowing citizens to evaluate walking routes against known stray dog pack hot zones.
- **Safety & Rabies Guide (`SafetyGuide.jsx`)**: Educational resources covering dog body language, bite protocol, emergency contacts, and vaccination awareness.

## Key Technical Dependencies
- Web Speech API (`window.SpeechRecognition` / `webkitSpeechRecognition`) for voice input.
- MediaDevices API (`getUserMedia`) & File/Gallery Picker (`<input type="file" accept="image/*,video/*">`).
- [[risk-engine|Image Quality Gate & Vision Engine]] for edge photo/video frame canine verification.
- [[supabase-backend-service|Supabase Client Services]] for real-time submission and status updates.

## Related Concepts
- [[pawlytics-web-app]]
- [[authority-portal]]
- [[risk-engine]]
