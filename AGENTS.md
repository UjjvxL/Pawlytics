# AGENTS.md

## Project Context

This is the **Pawlytics** web application repository — a React + Vite + Supabase + Tailwind CSS application for stray animal analytics and conflict intelligence.

Start with `README.md` for local setup, environment variables, and workflow details.

## Key Architecture & Files

- `src/`: React frontend application source code.
- `src/api/supabaseClient.js`: Supabase JS client configuration.
- `src/api/services/`: Modular API service layer (`auth.js`, `reports.js`, `hotspots.js`, `index.js`).
- `src/lib/riskEngine.js`: Explainable composite risk scoring calculation.
- `supabase/`: Master PostgreSQL schema, RLS policies, and seed migration scripts.
- `vite.config.js`: Vite build configuration.
- `.env.local`: Local-only environment credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

## Development Workflow

- Run `npm run dev` to start the Vite local development server.
- Run `npm run build` to verify production compilation.
- Run `npm run typecheck` to verify code health.
- Always preserve clean code structure, modern UI standards, and complete feature implementations.
