# Pawlytics — Stray Animal Analytics & Conflict Intelligence Platform

Pawlytics is a stray animal analytics, incident reporting, and conflict intelligence platform. It provides citizens with a real-time risk map, safe route navigation, and incident reporting tools, while empowering municipal authorities with a control dashboard, incident verification queue, sector risk heatmaps, escalation rules, and official GIS data export capabilities.

---

## 🚀 Key Features

### Citizen Mobile PWA (`/`)
- **Know Before You Go**: Sector-by-sector conflict risk status and verified report counts.
- **Incident Reporting Wizard**: Submit dog sightings, approaches, chases, aggressive interactions, or bites with location & category tags.
- **Interactive Live Risk Map**: Leaflet spatial map centered on active zones with hotspot radius overlays and verified incident pins.
- **Safe Route Check**: Path conflict exposure evaluation.
- **Rabies & Safety Guidance**: Behavioral safety reminders and emergency guidance.

### Municipal Authority Control Room (`/authority`)
- **Dashboard Overview**: Incident metrics, 30-day severity breakdown, verified bite tracking, and active hotspot summaries.
- **Verification Queue**: Triage interface for field officers to review, approve, or reject incoming reports.
- **Sector & Ward Analytics**: Dynamic risk calculation per ward using time decay, severity weighting, and group presence indicators.
- **Hotspots & Actions**: Cluster monitoring and animal birth control (ABC) campaign tracking.
- **Authority Settings (`/authority/settings`)**: Interactive 5-tab control room for municipal profiles, 24h escalation thresholds, citizen broadcast radii, team staff roles, and GeoJSON/CSV/PDF exports.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3.4
- **State & Router**: React Router DOM v6, TanStack React Query v5
- **UI Components**: Radix UI Primitives, Lucide React Icons, Framer Motion
- **Spatial / Maps**: Leaflet, React Leaflet, OpenStreetMap
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)

---

## 📋 Local Setup & Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/UjjvxL/Pawlytics.git
   cd Pawlytics
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create or update `.env.local` in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🗄️ Database Setup (Supabase)

1. Open your Supabase Dashboard SQL Editor.
2. Run the master SQL script located at `supabase/full_setup_migration.sql`.
3. This creates all 8 core tables (`reports`, `hotspots`, `wards`, `authority_actions`, `context_pois`, `verifications`, `alerts`, `users`), RLS security policies, user creation triggers, and demo seed data.

---

## 📄 License & Ownership

Owned and maintained by the Pawlytics engineering team. All rights reserved.
