# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ManholeGuard is a predictive, QR-based digital safety system protecting sanitation workers during manhole entry. It tracks entry in real time, predicts environmental risks via AI scoring, and automatically alerts authorities if workers don't return safely. The full specification lives in `MANHOLEGUARD_CLAUDE_CODE.md`.

## Repository State

Fully implemented Turborepo monorepo, deployed via Firebase (Auth + Hosting + Functions). PostgreSQL remains on Supabase.

## Tech Stack

- **Monorepo**: Turborepo with npm
- **Backend** (`apps/api/`): Express.js 4.x + TypeScript (strict) + Prisma 5.x + PostgreSQL 15 (Supabase) + Firebase Functions + Zod validation
- **Auth**: Firebase Authentication (Email/Password + Google sign-in) — backend verifies Firebase ID tokens, maps to Prisma UUIDs
- **Dashboard** (`apps/dashboard/`): React 18 + Vite + TypeScript + Tailwind + Zustand + TanStack Query + Recharts + Leaflet
- **Worker App** (`apps/worker-app/`): React PWA + html5-qrcode + Dexie.js (IndexedDB) + Service Worker + Web Push
- **Citizen Portal** (`apps/citizen-portal/`): Lightweight React SPA + Tailwind + Leaflet (no auth)
- **Shared** (`packages/shared/`): TypeScript types, constants, i18n translations (6 languages)
- **Offline Sync** (`packages/offline-sync/`): Shared offline sync logic
- **Hosting**: Firebase Hosting (3 targets: dashboard, worker-app, citizen-portal)
- **Scheduled Jobs**: Firebase Cloud Scheduler (replaces BullMQ/Redis)

## Build & Development Commands

```bash
# Install dependencies
npm install

# Start PostgreSQL for local dev
docker-compose up -d postgres

# Database (from repo root or apps/api/)
npx prisma migrate dev --name init
npx prisma db seed

# Dev servers (each in its own terminal or via turbo)
npm run dev                              # all apps via turbo (api:4000, dashboard:3000, worker-app:3001, citizen-portal:3002)

# Firebase emulators (Auth emulator for local testing)
npm run emulators

# Deploy
npm run deploy                           # build all + deploy everything
npm run deploy:functions                 # deploy API only
npm run deploy:hosting                   # deploy frontends only

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
- **Scheduled Functions** (`apps/api/src/index.ts`): Firebase Cloud Scheduler functions (timer monitor, risk recalc, maintenance, weather, certifications)
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

All phases complete. Firebase migration done.

| # | Phase | Status |
|---|-------|--------|
| 1 | Prisma schema + migrations + seed data | Done |
| 2 | Auth + user management | Done (Firebase Auth) |
| 3 | Core entry flow (QR scan → geo-fence → checklist → risk → state machine) | Done |
| 4 | Timer monitor + dead man's switch + alerts | Done (Firebase Scheduled Function) |
| 5 | Dashboard (live entries, heatmap, analytics) | Done |
| 6 | Worker PWA (offline, QR scanner, check-in UI) | Done |
| 7 | Extended features (gas sensors, fatigue, SOS, certifications, maintenance) | Done |
| 8 | Citizen portal + grievances | Done |
| 9 | Compliance reports + audit trail | Done |
| 10 | Deployment | Done (Firebase Hosting + Functions) |

### Firebase Migration (completed)
- **Auth**: JWT/bcrypt replaced with Firebase Auth (Email/Password + Google sign-in). `firebaseUid` field on User model. Auth middleware verifies Firebase ID tokens and maps to Prisma UUIDs — zero changes to 30+ services.
- **Functions**: Express API exported as `onRequest` Cloud Function with `minInstances: 1`. Five scheduled functions replace BullMQ/Redis (timer monitor, risk recalc, maintenance, weather alerts, cert expiry).
- **Hosting**: 3 Firebase Hosting targets (dashboard, worker-app, citizen-portal) with SPA rewrites.
- **Removed**: BullMQ, ioredis, node-cron, jsonwebtoken, bcryptjs (runtime). Jobs directory deleted.
- **Kept**: PostgreSQL on Supabase, Prisma ORM, all services/controllers unchanged.
- **Migration script**: `scripts/migrate-users-to-firebase.ts` imports existing bcrypt-hashed passwords via `importUsers()`.

### Local Development Setup
1. `firebase login` (one-time, requires browser)
2. `docker-compose up -d postgres` (local PostgreSQL)
3. `npm run dev` (all apps via turbo)
4. `npm run emulators` (Firebase Auth/Functions/Hosting emulators)
5. Frontends auto-connect to Auth emulator when `VITE_FIREBASE_EMULATOR=true`

## Key Design Principles

1. **Safety-First**: Worker life over convenience — alerts fire even if worker is unconscious
2. **Offline-Capable**: Core safety features must work without internet
3. **Prevention Over Reaction**: Predict and prevent via risk scoring
4. **Complete Audit Trail**: Every action logged immutably (SHA-256 hash chain)
5. **Accessible**: Multi-language, voice alerts, large touch targets for gloved hands
