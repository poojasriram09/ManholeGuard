# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ManholeGuard is a predictive, QR-based digital safety system protecting sanitation workers during manhole entry. It tracks entry in real time, predicts environmental risks via AI scoring, and automatically alerts authorities if workers don't return safely. The full specification lives in `MANHOLEGUARD_CLAUDE_CODE.md`.

## Repository State

Fully implemented Turborepo monorepo. All free-tier deployment: Firebase Auth (Spark) + Firebase Hosting (Spark) + Render (free) + Supabase PostgreSQL (free) + cron-job.org (free).

## Tech Stack

- **Monorepo**: Turborepo with npm
- **Backend** (`apps/api/`): Express.js 4.x + TypeScript (strict) + Prisma 5.x + PostgreSQL 15 (Supabase) + Zod validation, hosted on Render (free)
- **Auth**: Firebase Authentication (Email/Password + Google sign-in) — backend verifies Firebase ID tokens, maps to Prisma UUIDs
- **Dashboard** (`apps/dashboard/`): React 18 + Vite + TypeScript + Tailwind + Zustand + TanStack Query + Recharts + Leaflet — **Dark industrial command center theme** (Google Fonts: Outfit/DM Sans/JetBrains Mono, CSS custom properties design system, glassmorphic sidebar, safety color glow effects, 13 CSS keyframe animations)
- **Worker App** (`apps/worker-app/`): React PWA + html5-qrcode + Dexie.js (IndexedDB) + Service Worker + Web Push
- **Citizen Portal** (`apps/citizen-portal/`): Lightweight React SPA + Tailwind + Leaflet (no auth)
- **Shared** (`packages/shared/`): TypeScript types, constants, i18n translations (6 languages)
- **Offline Sync** (`packages/offline-sync/`): Shared offline sync logic
- **Hosting**: Firebase Hosting Spark plan (3 targets: dashboard, worker-app, citizen-portal)
- **Scheduled Jobs**: cron-job.org (free) hitting `/api/cron/*` endpoints secured with `CRON_SECRET`

## Build & Development Commands

```bash
# Install dependencies
npm install

# Database (Supabase — no local Docker needed)
cd apps/api && npx prisma migrate dev
cd apps/api && npx prisma db seed

# Dev servers (all apps via turbo)
npm run dev    # api:4000, dashboard:3000, worker-app:3001, citizen-portal:3002

# Deploy frontends to Firebase Hosting (free Spark plan)
npm run deploy:hosting

# API deploys automatically via Render on git push (see render.yaml)

# Run tests (Vitest)
npx vitest                               # all tests
npx vitest run apps/api/src/services/    # specific directory
npx vitest run checkin.test.ts           # single test file

# User migration (existing bcrypt passwords → Firebase Auth)
npx tsx scripts/migrate-users-to-firebase.ts
```

## Architecture

### Backend Pattern (MVC-style)
`Routes → Controllers → Services → Prisma ORM`

- **Routes** (`apps/api/src/routes/`): Express route definitions with Zod middleware validation
- **Controllers** (`apps/api/src/controllers/`): Request/response handling, delegates to services
- **Services** (`apps/api/src/services/`): All domain logic — risk engine, alerts, check-ins, fatigue, gas monitoring, etc.
- **Middleware** (`apps/api/src/middleware/`): auth (Firebase ID token verification), errorHandler, rateLimiter, auditLog, geoFence
- **Cron Routes** (`apps/api/src/routes/cron.routes.ts`): HTTP endpoints for scheduled tasks, secured with `x-cron-secret` header, triggered by cron-job.org
- **Validators** (`apps/api/src/validators/`): Zod schemas for all API inputs

### Core Domain Logic

**Risk Engine** — weighted scoring algorithm:
```
risk_score = blockage_freq*0.25 + incidents*0.20 + rainfall*0.15 + area_risk*0.10 + gas*0.20 + weather*0.10
< 30 → SAFE | < 60 → CAUTION | >= 60 → PROHIBITED
```

**Entry State Machine** (9 states, 12 events):
```
IDLE → SCANNED → CHECKLIST_PENDING → ENTERED → ACTIVE → EXITED
                                                  ↓
                                    OVERSTAY_ALERT / GAS_ALERT / CHECKIN_MISSED → SOS_TRIGGERED
```

**Dead Man's Switch**: Check-ins every 10 min while underground; 3 missed → auto SOS trigger.

**Geo-Fence**: Haversine distance check (default 50m radius) to verify physical proximity before entry.

**Fatigue Limits**: Max 4 entries/shift, 120 min underground/shift, 15 min rest between entries, 10-hour max shift.

**Audit Trail**: SHA-256 hash-chained log entries for tamper-evident legal compliance.

### Frontend Patterns

- **State**: Zustand for client state, TanStack Query for server state
- **Real-time**: Supabase Realtime (WebSocket) subscriptions for live dashboard updates
- **Offline (Worker App)**: Service Worker + Dexie.js IndexedDB queue; SOS has highest sync priority on reconnect
- **i18n**: react-i18next with 6 languages (en, hi, mr, ta, te, kn)

### External API Integrations

| Service | API | Purpose |
|---------|-----|---------|
| OpenMeteo | open-meteo.com/v1/forecast | Rainfall + full weather data |
| Nominatim/OSM | nominatim.openstreetmap.org | Reverse geocoding |
| Overpass API | overpass-api.de | Nearest hospitals/fire stations for SOS |
| Twilio/MSG91 | SMS gateway | Alert notifications |
| web-push | VAPID | Browser push notifications |

## Implementation Progress

All phases complete. Firebase migration done. Database live on Supabase with seed data.

| # | Phase | Status |
|---|-------|--------|
| 1 | Prisma schema + migrations + seed data | Done — 27 tables on Supabase |
| 2 | Auth + user management | Done (Firebase Auth) — Service Account Key configured, login flow fixed |
| 3 | Core entry flow (QR scan → geo-fence → checklist → risk → state machine) | Done |
| 4 | Timer monitor + dead man's switch + alerts | Done (cron-job.org + HTTP endpoints) |
| 5 | Dashboard (live entries, heatmap, analytics) | Done |
| 6 | Worker PWA (offline, QR scanner, check-in UI) | Done |
| 7 | Extended features (gas sensors, fatigue, SOS, certifications, maintenance) | Done |
| 8 | Citizen portal + grievances | Done |
| 9 | Compliance reports + audit trail | Done |
| 10 | Deployment config | Done (Firebase Hosting + Render + cron-job.org) |
| 11 | Dashboard UI Overhaul — "Industrial Command Center" | Done (~70 files, pure visual, zero logic changes) |

### Configuration Status

| Config | Status |
|--------|--------|
| Firebase project (manholeguard-9626) | Connected |
| Firebase Auth (Email/Password + Google) | Enabled in console |
| Firebase client SDK (dashboard + worker-app) | Configured with real keys |
| Firebase Service Account Key (API backend) | Configured in `apps/api/.env` |
| Supabase PostgreSQL | Connected (tmjvdnmcmxpwiyzvgfzy) |
| Prisma migration | Applied — 27 tables created |
| Database seed data | Applied — 1 admin, 3 supervisors, 12 workers, 40 manholes, 60 entries, etc. |
| Render deployment | Configured (render.yaml) — not yet deployed |
| cron-job.org | Configured (cron.routes.ts) — not yet set up |

### What's Needed to Complete

1. **Verify login flow** — test dashboard login at http://localhost:3000 with `admin@manholeguard.in` / `password123` (user must exist in both Firebase Auth and Prisma seed data).
2. **Supabase Service Role Key** — optional, needed for Realtime features. Get from Supabase dashboard → Settings → API.
3. **Deploy to Render** — push to GitHub, connect repo in Render dashboard, set env vars.
4. **Deploy to Firebase Hosting** — `npm run deploy:hosting` after building frontends.
5. **Set up cron-job.org** — create 5 jobs pointing to Render API URL with `x-cron-secret` header.

### Dashboard UI Overhaul (Phase 11)

Complete visual transformation of `apps/dashboard/` from generic light-themed CRUD panel to dark industrial command center. **Zero logic changes** — all API calls, routes, and state management unchanged. ~70 files modified across 7 tiers:

**Design System** (`index.css` + `tailwind.config.js`):
- 50+ CSS custom properties (backgrounds, text, borders, safety colors, chart palette, shadows, transitions)
- Fonts: Outfit (headings via `.font-heading`), DM Sans (body), JetBrains Mono (data/code)
- Colors: `safe` (emerald), `caution` (amber), `danger` (crimson), `accent` (blue), `live` (cyan) — each with `-muted` variant
- Surface layers: `surface-base` → `surface` → `surface-card` → `surface-elevated` → `surface-hover`
- CSS component classes: `.card-surface`, `.glass`, `.bg-grid`, `.input-dark`, `.btn-primary`
- 13 `@keyframes`: fadeInUp, fadeIn, slideInRight, scaleIn, pulseGlow, shimmer, breathe, progressFill, borderPulse, countUp, slideInLeft, spin, gradientShift
- `prefers-reduced-motion` media query for accessibility
- Leaflet popup dark overrides

**Layout**: Glassmorphic sidebar (`.glass` + 15 SVG Heroicons), dark header with pulsing cyan LIVE indicator, `.bg-grid` main area with `animate-fade-in-up` route transitions

**Key Patterns Applied Across All Components**:
- `bg-white` → `.card-surface` | `bg-gray-50` → `bg-surface-elevated` | `shadow` → `shadow-card`
- `text-gray-800` → `text-text-primary` | `text-gray-500` → `text-text-secondary` | `text-gray-400` → `text-text-muted`
- `divide-gray-200` → `divide-border` | `border-gray-300` → `border-border` | `hover:bg-gray-50` → `hover:bg-surface-hover`
- Form inputs: `.input-dark` class | Submit buttons: `.btn-primary` class
- Status badges: `bg-{color}-muted text-{color} border border-{color}/20`
- Section headings: `font-heading` added
- Tables: `.card-surface` wrapper, `bg-surface-elevated` thead, `divide-border` rows
- Charts (Recharts): CSS variable tooltips, `var(--chart-grid)` grid, `var(--text-muted)` axes
- Heatmap: CartoDB dark tile layer replacing OSM light tiles

**Google Fonts loaded via CDN** in `index.html` (preconnect + stylesheet). Zero new npm dependencies.

### Bug Fixes Applied
- **Login redirect race condition** (dashboard): `LoginPage` was calling `navigate('/')` immediately after `signInWithEmailAndPassword`, before `onAuthStateChanged` → `/auth/sync` had completed. Fixed by using `useEffect` on `user` state to redirect only after sync finishes.

### Deployment Architecture (all free tier)
- **Firebase Auth** (Spark plan, free): Email/Password + Google sign-in. `firebaseUid` field on User model. Auth middleware verifies Firebase ID tokens and maps to Prisma UUIDs — zero changes to 30+ services.
- **Firebase Hosting** (Spark plan, free): 3 targets (dashboard, worker-app, citizen-portal) with SPA rewrites.
- **Render** (free tier): Express API server. Auto-deploys on git push via `render.yaml`.
- **Supabase** (free tier): PostgreSQL database.
- **cron-job.org** (free): Calls `/api/cron/*` endpoints with `x-cron-secret` header for scheduled tasks (timer monitor every 1 min, risk recalc every 6h, maintenance daily, weather every 2h, cert expiry daily).

### Cron Job Setup (cron-job.org)
| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `POST /api/cron/timer-monitor` | Every 1 min | Dead man's switch, overstay alerts, gas alerts |
| `POST /api/cron/risk-recalculation` | Every 6 hours | Recalculate risk scores for all manholes |
| `POST /api/cron/maintenance` | Daily midnight | Check overdue maintenance, auto-schedule |
| `POST /api/cron/weather-alert` | Every 2 hours | Weather safety checks for active entries |
| `POST /api/cron/certification-expiry` | Daily 6 AM | Check expiring worker certifications |

All endpoints require header: `x-cron-secret: <CRON_SECRET>`

### Local Development Setup
1. `npm install`
2. `npm run dev` (starts all 4 apps — API connects to Supabase, no local Docker needed)
3. Dashboard: http://localhost:3000 | Worker App: http://localhost:3001 | Citizen Portal: http://localhost:3002
4. API health check: http://localhost:4000/health

## Key Design Principles

1. **Safety-First**: Worker life over convenience — alerts fire even if worker is unconscious
2. **Offline-Capable**: Core safety features must work without internet
3. **Prevention Over Reaction**: Predict and prevent via risk scoring
4. **Complete Audit Trail**: Every action logged immutably (SHA-256 hash chain)
5. **Accessible**: Multi-language, voice alerts, large touch targets for gloved hands
