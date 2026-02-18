# ManholeGuard — Claude Code Implementation Specification (v2.0 — Extended)

> **Purpose**: This document is the single source of truth for Claude Code to generate the entire ManholeGuard application — backend, frontend, services, database, and deployment configuration.
>
> **v2.0 Additions**: Offline mode, dead man's switch, PPE checklist, gas sensor integration, team entry, post-exit health check, fatigue tracking, geo-fencing, SOS routing, i18n, compliance reports, maintenance scheduling, public grievance portal, worker certifications, audit trail, voice alerts, advanced analytics, weather alerts.

---

## Table of Contents

### Core System
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema & Migrations](#5-database-schema--migrations)
6. [Backend API Server](#6-backend-api-server)
7. [Risk Prediction Engine](#7-risk-prediction-engine)
8. [Timer Monitor Service](#8-timer-monitor-service)
9. [Alert Engine](#9-alert-engine)
10. [Worker Mobile App (PWA)](#10-worker-mobile-app)
11. [Supervisor Dashboard (React Web)](#11-supervisor-dashboard)
12. [City Heatmap Module](#12-city-heatmap-module)
13. [State Machine Implementation](#13-state-machine-implementation)
14. [Authentication & Authorization](#14-authentication--authorization)
15. [External Integrations](#15-external-integrations)

### Extended Safety Features (NEW)
16. [Offline Mode & Background Sync](#16-offline-mode--background-sync)
17. [Dead Man's Switch — Periodic Check-In](#17-dead-mans-switch--periodic-check-in)
18. [Pre-Entry Safety Checklist (PPE Verification)](#18-pre-entry-safety-checklist-ppe-verification)
19. [Gas & Environmental Sensor Integration](#19-gas--environmental-sensor-integration)
20. [Multi-Worker / Team Entry Support](#20-multi-worker--team-entry-support)
21. [Post-Exit Health Confirmation](#21-post-exit-health-confirmation)
22. [Worker Fatigue & Shift Management](#22-worker-fatigue--shift-management)
23. [Geo-Fence Verification](#23-geo-fence-verification)
24. [Supervisor-Initiated Task Registration](#24-supervisor-initiated-task-registration)
25. [Emergency SOS & Nearest Facility Routing](#25-emergency-sos--nearest-facility-routing)

### Platform Features (NEW)
26. [Multi-Language Support (i18n)](#26-multi-language-support-i18n)
27. [Compliance Report Generation](#27-compliance-report-generation)
28. [Maintenance Scheduling Engine](#28-maintenance-scheduling-engine)
29. [Public Grievance / Citizen Reporting Portal](#29-public-grievance--citizen-reporting-portal)
30. [Worker Training & Certification Tracking](#30-worker-training--certification-tracking)
31. [Audit Trail & Tamper-Proof Logging](#31-audit-trail--tamper-proof-logging)
32. [Voice & Audio Alert System](#32-voice--audio-alert-system)
33. [Advanced Analytics & Reporting Module](#33-advanced-analytics--reporting-module)
34. [Weather Alert System (Beyond Rainfall)](#34-weather-alert-system-beyond-rainfall)

### Engineering
35. [Testing Strategy](#35-testing-strategy)
36. [Deployment & DevOps](#36-deployment--devops)
37. [Complete API Reference](#37-complete-api-reference)
38. [Error Handling & Logging](#38-error-handling--logging)
39. [Performance & Scalability](#39-performance--scalability)

### Appendices
- [Appendix A: Zod Validation Schemas](#appendix-a-zod-validation-schemas)
- [Appendix B: Shared Types](#appendix-b-shared-types)
- [Appendix C: Quick Start Commands](#appendix-c-quick-start-commands)
- [Appendix D: Implementation Priority Order](#appendix-d-implementation-priority-order)

---

## 1. Project Overview

**ManholeGuard** is a predictive, QR-based digital safety system that protects sanitation workers by tracking manhole entry in real time, predicting risks via AI scoring, and automatically alerting authorities if workers do not return safely.

### Core Workflow (end-to-end)

```
Supervisor Task Registration → QR Scan → Geo-Fence Verify → PPE Checklist
→ Risk Prediction → Entry Logging → Timer Monitoring → Dead Man's Switch Check-ins
→ Alert Trigger → Incident Storage → Heatmap Update → Dashboard Update
→ Post-Exit Health Confirmation → Shift Fatigue Tracking → Compliance Record
```

### USP Logic

```
Predict → Verify → Track → Monitor → Alert → Protect → Record → Improve
```

### Key Personas

| Persona         | Description                                                    |
|-----------------|----------------------------------------------------------------|
| **Worker**      | Sanitation worker who scans QR and enters manhole              |
| **Supervisor**  | Monitors active entries, registers tasks, receives alerts      |
| **Admin**       | Manages manholes, workers, system config, generates reports    |
| **Citizen**     | Public user who can report manhole issues via grievance portal |

### Design Principles

1. **Safety-First**: Every feature decision prioritizes worker life over convenience
2. **Works Without Worker Action**: Alerts fire even if worker is unconscious/phoneless
3. **Offline-Capable**: Core safety features work without internet connectivity
4. **Prevention Over Reaction**: Predict and prevent, not just detect and respond
5. **Complete Audit Trail**: Every action is logged immutably for legal compliance
6. **Accessible**: Multi-language, voice alerts, large touch targets for gloved hands

---

## 2. Tech Stack

### Backend
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x (strict mode)
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+ via Supabase
- **Real-time**: Supabase Realtime (WebSocket subscriptions) + Socket.io fallback
- **Queue/Scheduler**: node-cron (timer monitor), BullMQ (alert queue, report generation)
- **Validation**: Zod
- **Auth**: Supabase Auth (JWT-based)
- **i18n**: i18next (backend translations for notifications)
- **PDF Generation**: @react-pdf/renderer or PDFKit (compliance reports)
- **Text-to-Speech**: Google Cloud TTS API or Web Speech API (voice alerts)

### Frontend — Supervisor Dashboard
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet.js / react-leaflet (heatmap + markers + geo-fence zones)
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Real-time**: Supabase Realtime client
- **i18n**: react-i18next
- **Tables**: TanStack Table (for compliance reports, analytics)
- **Export**: xlsx (spreadsheet export), jspdf (PDF export)

### Frontend — Worker Mobile Interface
- **Approach**: Progressive Web App (PWA) with React
- **QR Scanner**: html5-qrcode library
- **Geolocation**: Browser Geolocation API
- **Notifications**: Web Push API + Service Worker
- **Offline**: Service Worker + IndexedDB (Dexie.js)
- **Vibration**: Vibration API (haptic alerts)
- **Audio**: Web Audio API (voice alerts, check-in beeps)
- **i18n**: react-i18next
- **Camera**: MediaDevices API (for post-exit photo confirmation)

### Frontend — Citizen Portal
- **Approach**: Lightweight React SPA or static page
- **Styling**: Tailwind CSS
- **Map**: Leaflet.js (pin-drop for location)
- **File Upload**: Direct to Supabase Storage

### External APIs
- **Rainfall**: OpenMeteo API — `https://api.open-meteo.com/v1/forecast`
- **Full Weather**: OpenMeteo — temperature, humidity, wind, storm alerts
- **Geocoding**: Nominatim / OpenStreetMap (reverse geocoding)
- **Nearest Hospital**: Overpass API (OpenStreetMap) — query for hospitals/fire stations
- **SMS Gateway**: Twilio / MSG91 (India-specific, for alerts)
- **Push Notifications**: web-push (VAPID keys)

---

## 3. Project Structure

Generate the following monorepo structure:

```
manholeguard/
├── package.json
├── turbo.json
├── .env.example
├── docker-compose.yml
│
├── packages/
│   ├── shared/                     # Shared types, constants, i18n
│   │   ├── package.json
│   │   └── src/
│   │       ├── types/
│   │       │   ├── manhole.ts
│   │       │   ├── worker.ts
│   │       │   ├── entry-log.ts
│   │       │   ├── incident.ts
│   │       │   ├── checklist.ts          # NEW: PPE checklist types
│   │       │   ├── gas-reading.ts        # NEW: Sensor data types
│   │       │   ├── shift.ts              # NEW: Shift/fatigue types
│   │       │   ├── grievance.ts          # NEW: Public grievance types
│   │       │   ├── certification.ts      # NEW: Worker cert types
│   │       │   ├── maintenance.ts        # NEW: Scheduling types
│   │       │   ├── audit.ts              # NEW: Audit trail types
│   │       │   └── api-responses.ts
│   │       ├── constants/
│   │       │   ├── risk-levels.ts
│   │       │   ├── entry-status.ts
│   │       │   ├── state-machine.ts
│   │       │   ├── ppe-items.ts          # NEW: PPE checklist items
│   │       │   ├── gas-thresholds.ts     # NEW: Safe gas level limits
│   │       │   ├── fatigue-limits.ts     # NEW: Max entries/hours per shift
│   │       │   └── supported-languages.ts # NEW
│   │       ├── i18n/                     # NEW: Translation files
│   │       │   ├── en.json
│   │       │   ├── hi.json               # Hindi
│   │       │   ├── mr.json               # Marathi
│   │       │   ├── ta.json               # Tamil
│   │       │   ├── te.json               # Telugu
│   │       │   └── kn.json               # Kannada
│   │       └── index.ts
│   │
│   └── offline-sync/                     # NEW: Shared offline logic
│       ├── package.json
│       └── src/
│           ├── sync-engine.ts
│           ├── conflict-resolver.ts
│           └── queue.ts
│
├── apps/
│   ├── api/                        # Backend API Server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── index.ts
│   │       ├── app.ts
│   │       ├── config/
│   │       │   ├── env.ts
│   │       │   ├── database.ts
│   │       │   ├── supabase.ts
│   │       │   ├── bullmq.ts             # NEW: Queue config
│   │       │   └── i18n.ts               # NEW: Backend i18n
│   │       ├── middleware/
│   │       │   ├── auth.ts
│   │       │   ├── errorHandler.ts
│   │       │   ├── rateLimiter.ts
│   │       │   ├── validate.ts
│   │       │   ├── auditLog.ts           # NEW: Auto audit trail
│   │       │   └── geoFence.ts           # NEW: Location verification
│   │       ├── routes/
│   │       │   ├── index.ts
│   │       │   ├── scan.routes.ts
│   │       │   ├── entry.routes.ts
│   │       │   ├── worker.routes.ts
│   │       │   ├── manhole.routes.ts
│   │       │   ├── incident.routes.ts
│   │       │   ├── dashboard.routes.ts
│   │       │   ├── alert.routes.ts
│   │       │   ├── checklist.routes.ts    # NEW
│   │       │   ├── checkin.routes.ts      # NEW: Dead man's switch
│   │       │   ├── gas.routes.ts          # NEW: Sensor data
│   │       │   ├── health.routes.ts       # NEW: Post-exit health
│   │       │   ├── shift.routes.ts        # NEW
│   │       │   ├── task.routes.ts         # NEW: Supervisor tasks
│   │       │   ├── sos.routes.ts          # NEW: Emergency SOS
│   │       │   ├── grievance.routes.ts    # NEW: Citizen portal
│   │       │   ├── certification.routes.ts # NEW
│   │       │   ├── maintenance.routes.ts  # NEW
│   │       │   ├── report.routes.ts       # NEW: Compliance reports
│   │       │   ├── analytics.routes.ts    # NEW
│   │       │   ├── audit.routes.ts        # NEW
│   │       │   └── sync.routes.ts         # NEW: Offline sync
│   │       ├── controllers/
│   │       │   ├── scan.controller.ts
│   │       │   ├── entry.controller.ts
│   │       │   ├── worker.controller.ts
│   │       │   ├── manhole.controller.ts
│   │       │   ├── incident.controller.ts
│   │       │   ├── dashboard.controller.ts
│   │       │   ├── alert.controller.ts
│   │       │   ├── checklist.controller.ts    # NEW
│   │       │   ├── checkin.controller.ts      # NEW
│   │       │   ├── gas.controller.ts          # NEW
│   │       │   ├── health.controller.ts       # NEW
│   │       │   ├── shift.controller.ts        # NEW
│   │       │   ├── task.controller.ts         # NEW
│   │       │   ├── sos.controller.ts          # NEW
│   │       │   ├── grievance.controller.ts    # NEW
│   │       │   ├── certification.controller.ts # NEW
│   │       │   ├── maintenance.controller.ts  # NEW
│   │       │   ├── report.controller.ts       # NEW
│   │       │   ├── analytics.controller.ts    # NEW
│   │       │   ├── audit.controller.ts        # NEW
│   │       │   └── sync.controller.ts         # NEW
│   │       ├── services/
│   │       │   ├── risk-engine.service.ts
│   │       │   ├── timer-monitor.service.ts
│   │       │   ├── alert.service.ts
│   │       │   ├── entry.service.ts
│   │       │   ├── manhole.service.ts
│   │       │   ├── worker.service.ts
│   │       │   ├── incident.service.ts
│   │       │   ├── rainfall.service.ts
│   │       │   ├── notification.service.ts
│   │       │   ├── checklist.service.ts       # NEW
│   │       │   ├── checkin.service.ts         # NEW: Dead man's switch
│   │       │   ├── gas-monitor.service.ts     # NEW
│   │       │   ├── health-check.service.ts    # NEW
│   │       │   ├── shift.service.ts           # NEW
│   │       │   ├── fatigue.service.ts         # NEW
│   │       │   ├── geofence.service.ts        # NEW
│   │       │   ├── task.service.ts            # NEW
│   │       │   ├── sos.service.ts             # NEW
│   │       │   ├── nearest-facility.service.ts # NEW
│   │       │   ├── grievance.service.ts       # NEW
│   │       │   ├── certification.service.ts   # NEW
│   │       │   ├── maintenance.service.ts     # NEW
│   │       │   ├── report.service.ts          # NEW
│   │       │   ├── analytics.service.ts       # NEW
│   │       │   ├── audit.service.ts           # NEW
│   │       │   ├── sync.service.ts            # NEW
│   │       │   ├── weather.service.ts         # NEW: Extended weather
│   │       │   └── voice-alert.service.ts     # NEW
│   │       ├── jobs/                          # NEW: BullMQ job processors
│   │       │   ├── risk-recalculation.job.ts
│   │       │   ├── report-generation.job.ts
│   │       │   ├── maintenance-scheduler.job.ts
│   │       │   ├── weather-alert-check.job.ts
│   │       │   └── certification-expiry.job.ts
│   │       ├── utils/
│   │       │   ├── logger.ts
│   │       │   ├── state-machine.ts
│   │       │   ├── helpers.ts
│   │       │   ├── geo-utils.ts              # NEW: Distance, bounding box
│   │       │   └── crypto.ts                 # NEW: Audit hash generation
│   │       └── validators/
│   │           ├── scan.validator.ts
│   │           ├── entry.validator.ts
│   │           ├── manhole.validator.ts
│   │           ├── checklist.validator.ts     # NEW
│   │           ├── gas.validator.ts           # NEW
│   │           ├── health.validator.ts        # NEW
│   │           ├── grievance.validator.ts     # NEW
│   │           └── task.validator.ts          # NEW
│   │
│   ├── dashboard/                  # Supervisor Web Dashboard
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   ├── public/
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── i18n.ts                    # NEW
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   ├── entries.ts
│   │       │   ├── alerts.ts
│   │       │   ├── manholes.ts
│   │       │   ├── dashboard.ts
│   │       │   ├── tasks.ts              # NEW
│   │       │   ├── reports.ts            # NEW
│   │       │   ├── analytics.ts          # NEW
│   │       │   ├── grievances.ts         # NEW
│   │       │   ├── maintenance.ts        # NEW
│   │       │   ├── certifications.ts     # NEW
│   │       │   └── audit.ts              # NEW
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── Sidebar.tsx
│   │       │   │   ├── Header.tsx
│   │       │   │   └── DashboardLayout.tsx
│   │       │   ├── entries/
│   │       │   │   ├── ActiveEntriesTable.tsx
│   │       │   │   ├── EntryCard.tsx
│   │       │   │   ├── EntryTimerBadge.tsx
│   │       │   │   └── TeamEntryBadge.tsx      # NEW
│   │       │   ├── alerts/
│   │       │   │   ├── AlertPanel.tsx
│   │       │   │   ├── AlertCard.tsx
│   │       │   │   ├── AlertHistory.tsx
│   │       │   │   └── SOSAlertCard.tsx         # NEW
│   │       │   ├── heatmap/
│   │       │   │   ├── CityHeatmap.tsx
│   │       │   │   ├── ManholeMarker.tsx
│   │       │   │   ├── RiskLegend.tsx
│   │       │   │   ├── GeoFenceZone.tsx         # NEW
│   │       │   │   └── NearestFacilityLayer.tsx # NEW
│   │       │   ├── stats/
│   │       │   │   ├── StatsOverview.tsx
│   │       │   │   ├── RiskDistributionChart.tsx
│   │       │   │   └── IncidentTrendChart.tsx
│   │       │   ├── tasks/                       # NEW
│   │       │   │   ├── TaskRegistrationForm.tsx
│   │       │   │   ├── ActiveTasksList.tsx
│   │       │   │   └── TaskHistoryTable.tsx
│   │       │   ├── gas/                         # NEW
│   │       │   │   ├── GasReadingPanel.tsx
│   │       │   │   └── GasAlertBanner.tsx
│   │       │   ├── reports/                     # NEW
│   │       │   │   ├── ComplianceReportForm.tsx
│   │       │   │   ├── ReportPreview.tsx
│   │       │   │   └── ReportExportButtons.tsx
│   │       │   ├── analytics/                   # NEW
│   │       │   │   ├── AnalyticsDashboard.tsx
│   │       │   │   ├── WorkerPerformanceChart.tsx
│   │       │   │   ├── AreaSafetyTrendChart.tsx
│   │       │   │   ├── ResponseTimeChart.tsx
│   │       │   │   └── PredictiveInsightsPanel.tsx
│   │       │   ├── maintenance/                 # NEW
│   │       │   │   ├── ScheduleCalendar.tsx
│   │       │   │   ├── OverdueMaintenanceList.tsx
│   │       │   │   └── MaintenanceForm.tsx
│   │       │   ├── certifications/              # NEW
│   │       │   │   ├── WorkerCertTable.tsx
│   │       │   │   ├── ExpiringCertsAlert.tsx
│   │       │   │   └── CertUploadForm.tsx
│   │       │   ├── grievances/                  # NEW
│   │       │   │   ├── GrievanceQueue.tsx
│   │       │   │   └── GrievanceDetail.tsx
│   │       │   ├── audit/                       # NEW
│   │       │   │   ├── AuditLogTable.tsx
│   │       │   │   └── AuditLogFilters.tsx
│   │       │   └── common/
│   │       │       ├── Badge.tsx
│   │       │       ├── Card.tsx
│   │       │       ├── Spinner.tsx
│   │       │       ├── StatusIndicator.tsx
│   │       │       └── LanguageSwitcher.tsx      # NEW
│   │       ├── pages/
│   │       │   ├── DashboardPage.tsx
│   │       │   ├── ActiveEntriesPage.tsx
│   │       │   ├── AlertsPage.tsx
│   │       │   ├── HeatmapPage.tsx
│   │       │   ├── IncidentsPage.tsx
│   │       │   ├── WorkersPage.tsx
│   │       │   ├── ManholesPage.tsx
│   │       │   ├── LoginPage.tsx
│   │       │   ├── TaskRegistrationPage.tsx     # NEW
│   │       │   ├── AnalyticsPage.tsx            # NEW
│   │       │   ├── ComplianceReportsPage.tsx    # NEW
│   │       │   ├── MaintenancePage.tsx          # NEW
│   │       │   ├── CertificationsPage.tsx       # NEW
│   │       │   ├── GrievancesPage.tsx           # NEW
│   │       │   ├── AuditLogPage.tsx             # NEW
│   │       │   └── SettingsPage.tsx             # NEW
│   │       ├── hooks/
│   │       │   ├── useActiveEntries.ts
│   │       │   ├── useAlerts.ts
│   │       │   ├── useRealtimeEntries.ts
│   │       │   ├── useRiskData.ts
│   │       │   ├── useGasReadings.ts            # NEW
│   │       │   └── useAnalytics.ts              # NEW
│   │       ├── store/
│   │       │   ├── authStore.ts
│   │       │   └── dashboardStore.ts
│   │       └── utils/
│   │           ├── formatters.ts
│   │           └── constants.ts
│   │
│   ├── worker-app/                 # Worker PWA
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   ├── public/
│   │   │   ├── manifest.json
│   │   │   ├── sw.js                # Service Worker (offline + push + check-in)
│   │   │   ├── offline.html         # NEW: Offline fallback page
│   │   │   └── audio/               # NEW: Alert sounds
│   │   │       ├── checkin-beep.mp3
│   │   │       ├── warning-alarm.mp3
│   │   │       └── sos-siren.mp3
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── i18n.ts              # NEW
│   │       ├── db/                  # NEW: IndexedDB for offline
│   │       │   ├── dexie.ts
│   │       │   └── offline-store.ts
│   │       ├── pages/
│   │       │   ├── ScanPage.tsx
│   │       │   ├── EntryPage.tsx
│   │       │   ├── ActiveSessionPage.tsx
│   │       │   ├── HistoryPage.tsx
│   │       │   ├── LoginPage.tsx
│   │       │   ├── ChecklistPage.tsx        # NEW: PPE checklist
│   │       │   ├── CheckInPage.tsx          # NEW: Dead man's switch
│   │       │   ├── HealthCheckPage.tsx      # NEW: Post-exit health
│   │       │   ├── SOSPage.tsx              # NEW: Emergency SOS
│   │       │   └── ShiftSummaryPage.tsx     # NEW
│   │       ├── components/
│   │       │   ├── QRScanner.tsx
│   │       │   ├── RiskDisplay.tsx
│   │       │   ├── EntryTimer.tsx
│   │       │   ├── ExitButton.tsx
│   │       │   ├── AlertBanner.tsx
│   │       │   ├── PPEChecklist.tsx          # NEW
│   │       │   ├── CheckInPrompt.tsx         # NEW
│   │       │   ├── GasReadingDisplay.tsx     # NEW
│   │       │   ├── SOSButton.tsx             # NEW
│   │       │   ├── HealthCheckForm.tsx       # NEW
│   │       │   ├── OfflineIndicator.tsx      # NEW
│   │       │   ├── VoiceAlert.tsx            # NEW
│   │       │   ├── GeoFenceStatus.tsx        # NEW
│   │       │   ├── FatigueBanner.tsx         # NEW
│   │       │   └── LanguageSwitcher.tsx      # NEW
│   │       └── hooks/
│   │           ├── useQRScanner.ts
│   │           ├── useEntry.ts
│   │           ├── useLocation.ts
│   │           ├── useOfflineSync.ts         # NEW
│   │           ├── useCheckIn.ts             # NEW
│   │           ├── useVibration.ts           # NEW
│   │           ├── useAudioAlert.ts          # NEW
│   │           └── useWakeLock.ts            # NEW
│   │
│   └── citizen-portal/              # NEW: Public grievance portal
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── pages/
│           │   ├── ReportIssuePage.tsx
│           │   ├── TrackStatusPage.tsx
│           │   └── PublicHeatmapPage.tsx
│           └── components/
│               ├── IssueForm.tsx
│               ├── LocationPicker.tsx
│               ├── PhotoUpload.tsx
│               └── StatusTracker.tsx
```

---

## 4. Environment Variables

Create a `.env.example` with the following:

```env
# ── Database ──
DATABASE_URL=postgresql://postgres:password@localhost:5432/manholeguard
DIRECT_URL=postgresql://postgres:password@localhost:5432/manholeguard

# ── Supabase ──
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── Server ──
PORT=4000
NODE_ENV=development
API_BASE_URL=http://localhost:4000

# ── Auth ──
JWT_SECRET=your-jwt-secret

# ── External APIs ──
OPENMETEO_BASE_URL=https://api.open-meteo.com/v1/forecast

# ── Alert Config ──
ALERT_CHECK_INTERVAL_MS=30000
DEFAULT_ALLOWED_DURATION_MINUTES=45
ALERT_SMS_ENABLED=false
ALERT_EMAIL_ENABLED=true

# ── NEW: Dead Man's Switch ──
CHECKIN_INTERVAL_MINUTES=10
CHECKIN_GRACE_PERIOD_SECONDS=60
MISSED_CHECKIN_ALERT_THRESHOLD=2

# ── NEW: Geo-Fence ──
GEOFENCE_RADIUS_METERS=50
GEOFENCE_STRICT_MODE=true

# ── NEW: Fatigue Limits ──
MAX_ENTRIES_PER_SHIFT=4
MAX_UNDERGROUND_MINUTES_PER_SHIFT=120
MIN_REST_BETWEEN_ENTRIES_MINUTES=15
MAX_SHIFT_HOURS=10

# ── NEW: Gas Sensor Thresholds (ppm) ──
GAS_H2S_WARNING=10
GAS_H2S_DANGER=20
GAS_CH4_WARNING=1000
GAS_CH4_DANGER=5000
GAS_CO_WARNING=35
GAS_CO_DANGER=100
GAS_O2_LOW=19.5
GAS_O2_HIGH=23.5

# ── NEW: SMS Gateway ──
SMS_PROVIDER=msg91
SMS_API_KEY=your-sms-key
SMS_SENDER_ID=MHGARD
SMS_TEMPLATE_ID=your-template-id

# ── NEW: Push Notifications (VAPID) ──
VAPID_PUBLIC_KEY=your-vapid-public
VAPID_PRIVATE_KEY=your-vapid-private
VAPID_SUBJECT=mailto:admin@manholeguard.in

# ── NEW: BullMQ / Redis ──
REDIS_URL=redis://localhost:6379

# ── NEW: Report Generation ──
REPORT_STORAGE_PATH=/tmp/reports
COMPLIANCE_REPORT_RETENTION_DAYS=365

# ── NEW: Citizen Portal ──
CITIZEN_PORTAL_URL=http://localhost:3002
GRIEVANCE_AUTO_CLOSE_DAYS=30

# ── Frontend ──
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DEFAULT_LANGUAGE=en
VITE_CITY_LAT=19.076
VITE_CITY_LNG=72.8777
VITE_CITY_NAME=Mumbai
```

---

## 5. Database Schema & Migrations

### Prisma Schema (`prisma/schema.prisma`)

Generate this exact Prisma schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ════════════════════════ Enums ════════════════════════

enum RiskLevel {
  SAFE
  CAUTION
  PROHIBITED
}

enum EntryStatus {
  ACTIVE
  EXITED
  OVERSTAY_ALERT
}

enum IncidentSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL          // NEW: For SOS / gas emergency
}

enum UserRole {
  WORKER
  SUPERVISOR
  ADMIN
  CITIZEN           // NEW: Public portal user
}

enum EntryState {
  IDLE
  SCANNED
  CHECKLIST_PENDING  // NEW: Awaiting PPE verification
  ENTERED
  ACTIVE
  EXITED
  OVERSTAY_ALERT
  SOS_TRIGGERED      // NEW
  GAS_ALERT          // NEW
  CHECKIN_MISSED     // NEW
}

enum ShiftStatus {       // NEW
  ACTIVE
  COMPLETED
  EXCEEDED_LIMIT
}

enum GrievanceStatus {   // NEW
  SUBMITTED
  UNDER_REVIEW
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum MaintenanceStatus { // NEW
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  OVERDUE
  CANCELLED
}

enum CertificationType { // NEW
  SAFETY_TRAINING
  CONFINED_SPACE
  FIRST_AID
  GAS_DETECTION
  PPE_USAGE
  MEDICAL_FITNESS
}

enum AuditAction {       // NEW
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  SCAN
  ENTRY_START
  ENTRY_EXIT
  ALERT_TRIGGERED
  ALERT_ACKNOWLEDGED
  SOS_ACTIVATED
  CHECKIN_RESPONSE
  CHECKIN_MISSED
  REPORT_GENERATED
  SETTING_CHANGED
}

// ════════════════════════ Core Models ════════════════════════

model User {
  id            String    @id @default(uuid()) @db.Uuid
  email         String    @unique
  passwordHash  String    @map("password_hash")
  role          UserRole  @default(WORKER)
  language      String    @default("en")      // NEW: Preferred language
  pushSubscription Json?  @map("push_subscription") // NEW: Web Push subscription
  isActive      Boolean   @default(true) @map("is_active")
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  worker     Worker?
  supervisor Supervisor?
  auditLogs  AuditLog[]   // NEW

  @@map("users")
}

model Supervisor {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @unique @map("user_id") @db.Uuid
  name      String
  phone     String
  area      String?
  createdAt DateTime @default(now()) @map("created_at")

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  workers Worker[]
  tasks   Task[]   // NEW

  @@map("supervisors")
}

model Worker {
  id           String   @id @default(uuid()) @db.Uuid
  userId       String   @unique @map("user_id") @db.Uuid
  employeeId   String   @unique @map("employee_id")
  name         String
  phone        String
  supervisorId String?  @map("supervisor_id") @db.Uuid
  dateOfBirth  DateTime? @map("date_of_birth")          // NEW
  bloodGroup   String?   @map("blood_group")            // NEW
  emergencyContactName  String? @map("emergency_contact_name")    // NEW
  emergencyContactPhone String? @map("emergency_contact_phone")  // NEW
  medicalNotes String?  @map("medical_notes")           // NEW
  photoUrl     String?  @map("photo_url")               // NEW
  createdAt    DateTime @default(now()) @map("created_at")

  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  supervisor     Supervisor?     @relation(fields: [supervisorId], references: [id])
  entryLogs      EntryLog[]
  incidents      Incident[]
  shifts         Shift[]         // NEW
  certifications WorkerCertification[]  // NEW
  healthChecks   HealthCheck[]   // NEW
  checkIns       CheckIn[]       // NEW

  @@map("workers")
}

model Manhole {
  id             String    @id @default(uuid()) @db.Uuid
  qrCodeId       String    @unique @map("qr_code_id")
  latitude       Float
  longitude      Float
  area           String
  address        String?
  depth          Float?    @default(0)
  diameter       Float?    @default(0)               // NEW: Manhole diameter (meters)
  maxWorkers     Int       @default(2) @map("max_workers")  // NEW: Max concurrent workers
  riskLevel      RiskLevel @default(SAFE) @map("risk_level")
  riskScore      Float     @default(0) @map("risk_score")
  geoFenceRadius Float     @default(50) @map("geo_fence_radius") // NEW: meters
  lastCleanedAt  DateTime? @map("last_cleaned_at")
  nextMaintenanceAt DateTime? @map("next_maintenance_at")  // NEW
  hasGasSensor   Boolean   @default(false) @map("has_gas_sensor") // NEW
  sensorDeviceId String?   @map("sensor_device_id")        // NEW
  nearestHospital     String? @map("nearest_hospital")     // NEW
  nearestHospitalDist Float?  @map("nearest_hospital_dist") // NEW: km
  nearestFireStation  String? @map("nearest_fire_station")  // NEW
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  entryLogs     EntryLog[]
  incidents     Incident[]
  riskLogs      RiskLog[]
  blockages     Blockage[]
  gasReadings   GasReading[]    // NEW
  maintenances  Maintenance[]   // NEW
  grievances    Grievance[]     // NEW

  @@index([area])
  @@index([riskLevel])
  @@map("manholes")
}

model EntryLog {
  id                     String      @id @default(uuid()) @db.Uuid
  workerId               String      @map("worker_id") @db.Uuid
  manholeId              String      @map("manhole_id") @db.Uuid
  taskId                 String?     @map("task_id") @db.Uuid          // NEW: Linked supervisor task
  shiftId                String?     @map("shift_id") @db.Uuid        // NEW: Linked shift
  entryTime              DateTime    @default(now()) @map("entry_time")
  exitTime               DateTime?   @map("exit_time")
  allowedDurationMinutes Int         @default(45) @map("allowed_duration_minutes")
  status                 EntryStatus @default(ACTIVE)
  state                  EntryState  @default(ENTERED)
  geoLatitude            Float?      @map("geo_latitude")
  geoLongitude           Float?      @map("geo_longitude")
  geoVerified            Boolean     @default(false) @map("geo_verified")   // NEW
  checklistCompleted     Boolean     @default(false) @map("checklist_completed") // NEW
  teamEntryId            String?     @map("team_entry_id") @db.Uuid  // NEW: Groups team members
  isOfflineEntry         Boolean     @default(false) @map("is_offline_entry") // NEW
  syncedAt               DateTime?   @map("synced_at")                // NEW
  notes                  String?
  createdAt              DateTime    @default(now()) @map("created_at")
  updatedAt              DateTime    @updatedAt @map("updated_at")

  worker      Worker       @relation(fields: [workerId], references: [id])
  manhole     Manhole      @relation(fields: [manholeId], references: [id])
  task        Task?        @relation(fields: [taskId], references: [id])
  shift       Shift?       @relation(fields: [shiftId], references: [id])
  checklist   Checklist?   // NEW
  checkIns    CheckIn[]    // NEW
  healthCheck HealthCheck? // NEW

  @@index([status])
  @@index([workerId])
  @@index([manholeId])
  @@index([entryTime])
  @@index([teamEntryId])
  @@map("entry_logs")
}

model Incident {
  id           String           @id @default(uuid()) @db.Uuid
  manholeId    String           @map("manhole_id") @db.Uuid
  workerId     String?          @map("worker_id") @db.Uuid
  entryLogId   String?          @map("entry_log_id") @db.Uuid
  incidentType String           @map("incident_type")
  description  String?
  severity     IncidentSeverity @default(MEDIUM)
  resolved     Boolean          @default(false)
  resolvedAt   DateTime?        @map("resolved_at")
  resolvedBy   String?          @map("resolved_by") @db.Uuid  // NEW
  timestamp    DateTime         @default(now())
  createdAt    DateTime         @default(now()) @map("created_at")

  manhole Manhole @relation(fields: [manholeId], references: [id])
  worker  Worker? @relation(fields: [workerId], references: [id])

  @@index([severity])
  @@index([manholeId])
  @@index([timestamp])
  @@map("incidents")
}

model RiskLog {
  id               String    @id @default(uuid()) @db.Uuid
  manholeId        String    @map("manhole_id") @db.Uuid
  riskScore        Float     @map("risk_score")
  blockageFreq     Float     @map("blockage_freq")
  incidentCount    Int       @map("incident_count")
  rainfallFactor   Float     @map("rainfall_factor")
  areaRisk         Float     @map("area_risk")
  gasFactor        Float     @default(0) @map("gas_factor")         // NEW
  weatherFactor    Float     @default(0) @map("weather_factor")     // NEW
  computedLevel    RiskLevel @map("computed_level")
  calculatedAt     DateTime  @default(now()) @map("calculated_at")

  manhole Manhole @relation(fields: [manholeId], references: [id])

  @@index([manholeId])
  @@index([calculatedAt])
  @@map("risk_logs")
}

model Blockage {
  id         String           @id @default(uuid()) @db.Uuid
  manholeId  String           @map("manhole_id") @db.Uuid
  reportedAt DateTime         @default(now()) @map("reported_at")
  resolvedAt DateTime?        @map("resolved_at")
  severity   IncidentSeverity @default(LOW)

  manhole Manhole @relation(fields: [manholeId], references: [id])

  @@index([manholeId])
  @@map("blockages")
}

model AlertRecord {
  id             String    @id @default(uuid()) @db.Uuid
  entryLogId     String    @map("entry_log_id") @db.Uuid
  alertType      String    @map("alert_type")
  sentTo         String    @map("sent_to")
  sentAt         DateTime  @default(now()) @map("sent_at")
  channel        String    @default("push") // push, sms, email, voice
  acknowledged   Boolean   @default(false)
  acknowledgedAt DateTime? @map("acknowledged_at")
  acknowledgedBy String?   @map("acknowledged_by") @db.Uuid // NEW

  @@index([entryLogId])
  @@index([sentAt])
  @@map("alert_records")
}

// ════════════════════════ NEW: Safety Feature Models ════════════════════════

// ── Dead Man's Switch: Periodic Check-Ins ──

model CheckIn {
  id         String   @id @default(uuid()) @db.Uuid
  entryLogId String   @map("entry_log_id") @db.Uuid
  workerId   String   @map("worker_id") @db.Uuid
  promptedAt DateTime @map("prompted_at")
  respondedAt DateTime? @map("responded_at")
  wasOnTime  Boolean  @default(false) @map("was_on_time")
  method     String   @default("tap") // tap, shake, voice

  entryLog EntryLog @relation(fields: [entryLogId], references: [id])
  worker   Worker   @relation(fields: [workerId], references: [id])

  @@index([entryLogId])
  @@index([workerId])
  @@map("check_ins")
}

// ── Pre-Entry PPE Checklist ──

model Checklist {
  id          String   @id @default(uuid()) @db.Uuid
  entryLogId  String   @unique @map("entry_log_id") @db.Uuid
  items       Json     // Array of { item: string, checked: boolean, photoUrl?: string }
  allPassed   Boolean  @default(false) @map("all_passed")
  supervisorApproved Boolean @default(false) @map("supervisor_approved")
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime @default(now()) @map("created_at")

  entryLog EntryLog @relation(fields: [entryLogId], references: [id])

  @@map("checklists")
}

// ── Gas / Environmental Sensor Readings ──

model GasReading {
  id         String   @id @default(uuid()) @db.Uuid
  manholeId  String   @map("manhole_id") @db.Uuid
  h2s        Float    @default(0) // Hydrogen Sulfide (ppm)
  ch4        Float    @default(0) // Methane (ppm)
  co         Float    @default(0) // Carbon Monoxide (ppm)
  o2         Float    @default(20.9) // Oxygen (%)
  co2        Float    @default(0) // Carbon Dioxide (ppm)
  nh3        Float    @default(0) // Ammonia (ppm)
  temperature Float?  // Celsius
  humidity    Float?  // Percentage
  isDangerous Boolean @default(false) @map("is_dangerous")
  alertTriggered Boolean @default(false) @map("alert_triggered")
  source      String  @default("sensor") // sensor, manual
  readAt     DateTime @default(now()) @map("read_at")

  manhole Manhole @relation(fields: [manholeId], references: [id])

  @@index([manholeId])
  @@index([readAt])
  @@index([isDangerous])
  @@map("gas_readings")
}

// ── Post-Exit Health Confirmation ──

model HealthCheck {
  id         String   @id @default(uuid()) @db.Uuid
  entryLogId String   @unique @map("entry_log_id") @db.Uuid
  workerId   String   @map("worker_id") @db.Uuid
  feelingOk  Boolean  @map("feeling_ok")
  symptoms   String[] @default([])  // Array: dizziness, nausea, breathlessness, skin_irritation, eye_irritation, headache, none
  photoUrl   String?  @map("photo_url")  // Optional selfie for verification
  notes      String?
  needsMedical Boolean @default(false) @map("needs_medical")
  completedAt DateTime @default(now()) @map("completed_at")

  entryLog EntryLog @relation(fields: [entryLogId], references: [id])
  worker   Worker   @relation(fields: [workerId], references: [id])

  @@index([workerId])
  @@map("health_checks")
}

// ── Shift / Fatigue Management ──

model Shift {
  id           String      @id @default(uuid()) @db.Uuid
  workerId     String      @map("worker_id") @db.Uuid
  startTime    DateTime    @map("start_time")
  endTime      DateTime?   @map("end_time")
  status       ShiftStatus @default(ACTIVE)
  entryCount   Int         @default(0) @map("entry_count")
  totalUndergroundMinutes Int @default(0) @map("total_underground_minutes")
  breaksTaken  Int         @default(0) @map("breaks_taken")
  fatigueScore Float       @default(0) @map("fatigue_score") // 0-100
  notes        String?

  worker    Worker     @relation(fields: [workerId], references: [id])
  entryLogs EntryLog[]

  @@index([workerId])
  @@index([status])
  @@map("shifts")
}

// ── Supervisor Task Registration ──

model Task {
  id              String   @id @default(uuid()) @db.Uuid
  supervisorId    String   @map("supervisor_id") @db.Uuid
  manholeId       String?  @map("manhole_id") @db.Uuid
  assignedWorkerIds String[] @map("assigned_worker_ids") // UUID array
  taskType        String   @map("task_type") // cleaning, inspection, repair, emergency
  description     String?
  allowedDuration Int      @default(45) @map("allowed_duration") // minutes
  priority        String   @default("normal") // low, normal, high, urgent
  status          String   @default("pending") // pending, in_progress, completed, cancelled
  scheduledAt     DateTime? @map("scheduled_at")
  startedAt       DateTime? @map("started_at")
  completedAt     DateTime? @map("completed_at")
  createdAt       DateTime @default(now()) @map("created_at")

  supervisor Supervisor @relation(fields: [supervisorId], references: [id])
  entryLogs  EntryLog[]

  @@index([supervisorId])
  @@index([status])
  @@map("tasks")
}

// ── Worker Certifications ──

model WorkerCertification {
  id               String           @id @default(uuid()) @db.Uuid
  workerId         String           @map("worker_id") @db.Uuid
  type             CertificationType
  certificateNumber String?         @map("certificate_number")
  issuedAt         DateTime         @map("issued_at")
  expiresAt        DateTime         @map("expires_at")
  issuedBy         String?          @map("issued_by")
  documentUrl      String?          @map("document_url")
  isValid          Boolean          @default(true) @map("is_valid")
  createdAt        DateTime         @default(now()) @map("created_at")

  worker Worker @relation(fields: [workerId], references: [id])

  @@index([workerId])
  @@index([expiresAt])
  @@map("worker_certifications")
}

// ── Maintenance Scheduling ──

model Maintenance {
  id           String            @id @default(uuid()) @db.Uuid
  manholeId    String            @map("manhole_id") @db.Uuid
  type         String            // cleaning, structural, sensor_calibration
  status       MaintenanceStatus @default(SCHEDULED)
  scheduledAt  DateTime          @map("scheduled_at")
  completedAt  DateTime?         @map("completed_at")
  assignedTeam String?           @map("assigned_team")
  notes        String?
  autoGenerated Boolean          @default(false) @map("auto_generated")
  createdAt    DateTime          @default(now()) @map("created_at")

  manhole Manhole @relation(fields: [manholeId], references: [id])

  @@index([manholeId])
  @@index([status])
  @@index([scheduledAt])
  @@map("maintenances")
}

// ── Public Grievance Portal ──

model Grievance {
  id              String          @id @default(uuid()) @db.Uuid
  manholeId       String?         @map("manhole_id") @db.Uuid
  reporterName    String          @map("reporter_name")
  reporterPhone   String          @map("reporter_phone")
  reporterEmail   String?         @map("reporter_email")
  issueType       String          @map("issue_type") // open_manhole, overflow, foul_smell, blockage, structural_damage
  description     String
  latitude        Float?
  longitude       Float?
  address         String?
  photoUrls       String[]        @default([]) @map("photo_urls")
  status          GrievanceStatus @default(SUBMITTED)
  trackingCode    String          @unique @map("tracking_code") // Public tracking ID
  assignedTo      String?         @map("assigned_to") @db.Uuid
  resolvedAt      DateTime?       @map("resolved_at")
  resolutionNotes String?         @map("resolution_notes")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  manhole Manhole? @relation(fields: [manholeId], references: [id])

  @@index([status])
  @@index([trackingCode])
  @@index([createdAt])
  @@map("grievances")
}

// ── Audit Trail (Tamper-Proof Logging) ──

model AuditLog {
  id          String      @id @default(uuid()) @db.Uuid
  userId      String?     @map("user_id") @db.Uuid
  action      AuditAction
  entityType  String      @map("entity_type") // manhole, entry_log, worker, incident, etc.
  entityId    String?     @map("entity_id")
  oldValue    Json?       @map("old_value")
  newValue    Json?       @map("new_value")
  ipAddress   String?     @map("ip_address")
  userAgent   String?     @map("user_agent")
  hashChain   String?     @map("hash_chain") // SHA-256 hash linking to previous log entry
  timestamp   DateTime    @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([entityType, entityId])
  @@index([timestamp])
  @@map("audit_logs")
}

// ── Offline Sync Queue ──

model SyncQueue {
  id          String   @id @default(uuid()) @db.Uuid
  deviceId    String   @map("device_id")
  action      String   // entry_start, entry_exit, checkin, sos, gas_reading
  payload     Json
  createdAt   DateTime @default(now()) @map("created_at")
  syncedAt    DateTime? @map("synced_at")
  syncStatus  String   @default("pending") // pending, synced, conflict, failed
  conflictData Json?   @map("conflict_data")

  @@index([deviceId])
  @@index([syncStatus])
  @@map("sync_queue")
}

// ── SOS Emergency Records ──

model SOSRecord {
  id           String   @id @default(uuid()) @db.Uuid
  entryLogId   String?  @map("entry_log_id") @db.Uuid
  workerId     String   @map("worker_id") @db.Uuid
  latitude     Float?
  longitude    Float?
  triggerMethod String  @map("trigger_method") // button, missed_checkin, gas_alert, auto
  nearestHospital String? @map("nearest_hospital")
  hospitalDistance Float? @map("hospital_distance") // km
  nearestFireStation String? @map("nearest_fire_station")
  respondedAt  DateTime? @map("responded_at")
  resolvedAt   DateTime? @map("resolved_at")
  outcome      String?   // rescued, false_alarm, hospitalized
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([workerId])
  @@index([createdAt])
  @@map("sos_records")
}
```

### Seed Data

Generate a seed script (`prisma/seed.ts`) that creates:
- 3 supervisors with phone numbers and areas
- 12 workers (assigned to supervisors, with emergency contacts, blood groups)
- 40 manholes across 6 areas with varied risk levels, some with gas sensors
- 60 historical entry logs (mix of EXITED and OVERSTAY_ALERT, some team entries)
- 15 historical incidents (varied severity including CRITICAL)
- 25 blockage records
- 100 gas readings (varied, some dangerous)
- 30 check-in records
- 20 health checks (mix of ok and symptomatic)
- 8 worker certifications (some expired)
- 15 maintenance records (some overdue)
- 5 grievances (various statuses)
- 50 audit log entries
- Realistic latitude/longitude coordinates (use Mumbai, India as default city)
- 3 shifts with fatigue data
- 5 supervisor tasks

---

## 6. Backend API Server

### Express App Setup (`src/app.ts`)

```typescript
// Setup instructions for Claude Code:
// 1. Initialize Express with JSON body parsing (limit: 10mb)
// 2. Enable CORS for dashboard, worker-app, and citizen-portal origins
// 3. Add request logging middleware (morgan in dev, structured JSON in prod)
// 4. Add rate limiter: 100 requests/min for general, 20/min for scan endpoints
// 5. Mount all route groups under /api prefix
// 6. Mount citizen portal routes under /api/public (no auth required)
// 7. Add global error handler middleware
// 8. Add 404 catch-all handler
// 9. Add audit log middleware on all mutating routes (POST, PUT, DELETE)
```

### Server Entry Point (`src/index.ts`)

```typescript
// Setup instructions:
// 1. Load environment variables via dotenv
// 2. Initialize Prisma client
// 3. Initialize BullMQ workers and schedulers
// 4. Start Express server on configured PORT
// 5. Initialize TimerMonitorService on startup
// 6. Initialize CheckInMonitorService on startup  ← NEW
// 7. Initialize GasMonitorService on startup       ← NEW
// 8. Initialize WeatherAlertService on startup     ← NEW
// 9. Schedule recurring jobs:
//    - Risk recalculation: every 6 hours
//    - Certification expiry check: daily at 6 AM
//    - Maintenance overdue check: daily at 7 AM
//    - Weather alert check: every 2 hours
// 10. Graceful shutdown handler (SIGTERM, SIGINT) that:
//    - Stops all monitor services
//    - Drains BullMQ queues
//    - Disconnects Prisma
//    - Closes server
```

---

## 7. Risk Prediction Engine

### Service: `risk-engine.service.ts`

This is the core AI/prediction module. **v2.0 adds gas readings and weather factors.**

```typescript
class RiskEngineService {

  /**
   * UPDATED ALGORITHM (v2.0):
   *
   *   risk_score =
   *     blockage_frequency * 0.25 +
   *     incident_count     * 0.20 +
   *     rainfall_factor    * 0.15 +
   *     area_risk          * 0.10 +
   *     gas_factor         * 0.20 +     ← NEW
   *     weather_factor     * 0.10       ← NEW
   *
   * CLASSIFICATION:
   *   risk_score < 30  → SAFE
   *   risk_score < 60  → CAUTION
   *   risk_score >= 60 → PROHIBITED
   */
  async predictRisk(manholeId: string): Promise<RiskPrediction> {
    // Step 1: Fetch blockage frequency (same as v1)
    // Step 2: Fetch incident history (same as v1)
    // Step 3: Get rainfall factor (same as v1)
    // Step 4: Calculate area risk score (same as v1)

    // Step 5 (NEW): Gas factor
    //   - Fetch latest gas readings for this manhole (last 24h)
    //   - If ANY gas exceeds DANGER threshold → factor = 100
    //   - If ANY gas exceeds WARNING threshold → factor = 60
    //   - If no sensor data available → factor = 40 (unknown = cautious)
    //   - Otherwise → factor based on highest normalized gas reading

    // Step 6 (NEW): Weather factor
    //   - Fetch full weather data (temp, humidity, wind, storms)
    //   - Extreme heat (>42°C) → high factor (heat exhaustion risk)
    //   - Storm warning → high factor (flooding risk)
    //   - High humidity (>90%) + heat → elevated factor
    //   - Normal conditions → low factor

    // Step 7: Compute weighted score with NEW weights
    // Step 8: Classify risk level
    // Step 9: Store in risk_logs table (with gas_factor, weather_factor)
    // Step 10: Update manhole.risk_score and manhole.risk_level
    // Step 11: Return RiskPrediction object
  }

  /**
   * NEW: Check if a worker can safely enter based on combined factors.
   * This is the pre-entry safety gate.
   */
  async canWorkerEnter(manholeId: string, workerId: string): Promise<EntryClearance> {
    const risk = await this.predictRisk(manholeId);

    // Check 1: Risk level
    if (risk.riskLevel === 'PROHIBITED') return { allowed: false, reason: 'RISK_PROHIBITED' };

    // Check 2: Worker certifications
    const certsValid = await this.certService.hasValidCerts(workerId);
    if (!certsValid) return { allowed: false, reason: 'CERTS_EXPIRED' };

    // Check 3: Fatigue check
    const fatigueOk = await this.fatigueService.canWorkerEnter(workerId);
    if (!fatigueOk.allowed) return { allowed: false, reason: fatigueOk.reason };

    // Check 4: Gas levels (real-time)
    const gasOk = await this.gasService.isSafeToEnter(manholeId);
    if (!gasOk) return { allowed: false, reason: 'GAS_UNSAFE' };

    // Check 5: Weather
    const weatherOk = await this.weatherService.isSafeToWork(manholeId);
    if (!weatherOk) return { allowed: false, reason: 'WEATHER_UNSAFE' };

    // Check 6: Max workers capacity
    const activeCount = await this.getActiveWorkerCount(manholeId);
    const manhole = await this.manholeService.getById(manholeId);
    if (activeCount >= manhole.maxWorkers) return { allowed: false, reason: 'MANHOLE_FULL' };

    return { allowed: true, risk };
  }
}

interface EntryClearance {
  allowed: boolean;
  reason?: string;
  risk?: RiskPrediction;
}

interface RiskPrediction {
  manholeId: string;
  riskScore: number;
  riskLevel: 'SAFE' | 'CAUTION' | 'PROHIBITED';
  factors: {
    blockageFrequency: number;
    incidentCount: number;
    rainfallFactor: number;
    areaRisk: number;
    gasFactor: number;         // NEW
    weatherFactor: number;     // NEW
  };
  calculatedAt: Date;
}
```

### Rainfall Service (`rainfall.service.ts`)

```typescript
// Same as v1 — fetches from OpenMeteo API
// Cache results for 30 minutes per lat/lng pair
```

---

## 8. Timer Monitor Service

### Service: `timer-monitor.service.ts`

```typescript
// Same as v1 but with ONE ADDITION:
// After triggering an alert, also check if dead man's switch check-ins
// have been missed — if so, escalate immediately to CRITICAL.

// Warning Thresholds (same as v1):
// 80%  → WARNING to worker
// 100% → OVERSTAY_ALERT to supervisor
// 120% → Escalate to admin + nearby team
// 150% → EMERGENCY — all contacts + SOS
```

---

## 9. Alert Engine

### Service: `alert.service.ts`

```typescript
class AlertService {

  // Same as v1 triggerOverstayAlert, PLUS:

  /**
   * NEW: Triggered when gas levels exceed danger thresholds.
   */
  async triggerGasAlert(manholeId: string, reading: GasReading): Promise<void> {
    // 1. Find all ACTIVE entries in this manhole
    // 2. For each active entry:
    //    a. Update state = GAS_ALERT
    //    b. Send CRITICAL alert to worker: "EVACUATE IMMEDIATELY — toxic gas detected"
    //    c. Send CRITICAL alert to supervisor
    //    d. Create incident (severity: CRITICAL, type: GAS_EMERGENCY)
    //    e. If worker doesn't exit within 5 minutes, auto-trigger SOS
    // 3. Emit real-time event: gas_emergency
    // 4. Play voice alert on worker device
  }

  /**
   * NEW: Triggered when check-in is missed.
   */
  async triggerMissedCheckInAlert(entry: EntryLog, missedCount: number): Promise<void> {
    // 1 missed: WARNING to supervisor
    // 2 missed: OVERSTAY_ALERT level escalation
    // 3+ missed: Auto-trigger SOS (assume incapacitated)
  }

  /**
   * NEW: Manual or automatic SOS trigger.
   */
  async triggerSOS(workerId: string, entryLogId?: string, location?: LatLng): Promise<SOSRecord> {
    // 1. Create SOSRecord
    // 2. Find nearest hospital + fire station (Overpass API)
    // 3. CRITICAL alert to supervisor, admin, emergency contacts
    // 4. SMS to worker's emergency contact with location
    // 5. Update entry state = SOS_TRIGGERED
    // 6. Emit real-time event: sos_triggered
    // 7. Log in audit trail
    // 8. Return SOS record with nearest facility info
  }
}
```

---

## 10. Worker Mobile App

### UPDATED QR Scanner Page (`ScanPage.tsx`)

```typescript
// Same as v1, PLUS after successful scan:
// 1. Run geo-fence verification (is worker within radius of manhole?)
//    - If outside radius: show warning, require supervisor override
// 2. Run canWorkerEnter() clearance check
//    - If blocked: show specific reason (expired certs, fatigue, gas, etc.)
// 3. Show PPE checklist gate before ENTER button
// 4. Show team entry option if max_workers > 1
```

### NEW: PPE Checklist Page (`ChecklistPage.tsx`)

```typescript
// MANDATORY before entry is allowed.
//
// Checklist items (configurable per organization):
//   □ Safety helmet with headlamp
//   □ Gas detector device (personal)
//   □ Full-body safety harness with lifeline
//   □ Rubber gloves (elbow-length)
//   □ Gumboots (anti-slip, steel-toe)
//   □ Reflective safety vest
//   □ Face mask / respirator
//   □ First-aid kit accessible
//   □ Communication device charged
//   □ Tripod and winch setup at opening
//   □ Ventilation fan running (for confined space)
//   □ Supervisor present at site
//
// UI:
//   - Large checkboxes (easy to tap with gloves)
//   - Optional: camera button next to each item for photo proof
//   - All items must be checked to proceed
//   - "Request Supervisor Override" button if item unavailable
//   - Submit → creates Checklist record → enables ENTER button
//   - Displayed in worker's preferred language
```

### NEW: Dead Man's Switch — Check-In Prompt (`CheckInPrompt.tsx`)

```typescript
// Displayed at regular intervals while worker is inside manhole.
//
// Trigger: Every CHECKIN_INTERVAL_MINUTES (default: 10 min)
//
// UI:
//   - Full-screen overlay with large pulsing button: "TAP TO CONFIRM YOU ARE OK"
//   - Audio beep + vibration to alert worker
//   - Voice announcement in worker's language: "Please confirm you are safe"
//   - Grace period: CHECKIN_GRACE_PERIOD_SECONDS (default: 60 sec)
//   - Alternative response methods:
//     a. Tap the button
//     b. Shake the phone (accelerometer detection)
//     c. Voice response ("OK" / "I'm fine" — Web Speech API)
//   - If no response within grace period:
//     → CheckIn record: wasOnTime = false
//     → AlertService.triggerMissedCheckInAlert()
//   - Counter shows: "Check-in 2 of 4" based on allowed duration
```

### NEW: Post-Exit Health Check Page (`HealthCheckPage.tsx`)

```typescript
// Shown immediately after worker presses EXIT.
// MANDATORY to complete before task is marked done.
//
// UI:
//   - "How are you feeling?" → OK / NOT OK (large buttons)
//   - If NOT OK, show symptom checklist:
//     □ Dizziness
//     □ Nausea / vomiting
//     □ Difficulty breathing
//     □ Skin irritation / rash
//     □ Eye irritation / burning
//     □ Headache
//     □ Chest pain
//     □ Loss of consciousness (witnessed by buddy)
//   - Optional selfie capture (visual confirmation)
//   - Optional notes text field
//   - If ANY serious symptom selected:
//     → needsMedical = true
//     → Alert supervisor: "Worker reports medical symptoms after exit"
//     → Show nearest hospital info
//   - Record stored as HealthCheck
```

### NEW: SOS Page (`SOSPage.tsx`)

```typescript
// Accessible from ANY screen in the app — floating red SOS button.
//
// UI:
//   - Press and hold for 3 seconds to activate (prevents accidental)
//   - Or: rapid triple-press
//   - On activation:
//     1. Full-screen SOS mode (red background)
//     2. Capture current GPS location
//     3. Call triggerSOS() API
//     4. Display: "HELP IS ON THE WAY"
//     5. Show nearest hospital name + distance
//     6. Show supervisor contact info
//     7. Start audio siren (continuous beeping)
//     8. Vibration pattern (continuous)
//     9. Cancel button (requires confirm dialog)
//   - Works offline: queues SOS and sends when reconnected
//   - Service Worker keeps SOS alive even if app is closed
```

### NEW: Offline Indicator (`OfflineIndicator.tsx`)

```typescript
// Always-visible network status indicator.
// - Green dot: online, synced
// - Yellow dot: online, sync pending
// - Red dot: offline
// - Shows count of queued actions: "3 actions pending sync"
// - Tap to see sync queue details
```

### NEW: Fatigue Banner (`FatigueBanner.tsx`)

```typescript
// Shown when worker approaches fatigue limits.
// - "You've been underground for 95 of 120 max minutes this shift"
// - "This is your 3rd of 4 max entries this shift"
// - Color: yellow (approaching), red (at limit)
// - At limit: ENTER button disabled, shows "Rest required"
```

---

## 11. Supervisor Dashboard

### UPDATED Dashboard Overview Page (`DashboardPage.tsx`)

```typescript
// Same as v1, PLUS:
//
// Top Stats Row (6 cards — expanded):
//   1. Active Entries (count, real-time)
//   2. Active Alerts (count, pulsing if > 0)
//   3. SOS Active (count, RED pulsing if > 0)           ← NEW
//   4. Gas Warnings (count, manholes with unsafe gas)    ← NEW
//   5. Expiring Certifications (count, next 30 days)     ← NEW
//   6. Overdue Maintenance (count)                        ← NEW
//
// NEW Section: Task Registration Panel
//   - Quick-register a new task (assign worker, select manhole, set duration)
//   - View active tasks
//   - One-click "Start Inspection" workflow
//
// NEW Section: Live Gas Readings Panel
//   - Shows real-time gas levels for manholes with active entries
//   - Color-coded: green (safe), yellow (warning), red (danger)
//   - Auto-refresh every 30 seconds
```

### NEW: Task Registration Page (`TaskRegistrationPage.tsx`)

```typescript
// Supervisor creates tasks BEFORE workers go to the field.
//
// Form:
//   - Select Manhole (dropdown with search, shows risk level)
//   - Select Worker(s) (multi-select, shows certification status)
//   - Task Type: Cleaning | Inspection | Repair | Emergency
//   - Allowed Duration (minutes, pre-filled based on task type)
//   - Priority: Low | Normal | High | Urgent
//   - Schedule: Now | Specific Date/Time
//   - Notes (optional)
//
// Validations:
//   - Cannot assign worker with expired certifications
//   - Cannot assign worker currently in a shift exceeding fatigue limits
//   - Shows warning if manhole risk is CAUTION or PROHIBITED
//   - Shows warning if weather alerts are active
//
// On submit: Creates Task record, notifies assigned workers via push
```

### NEW: Analytics Page (`AnalyticsPage.tsx`)

```typescript
// Advanced analytics dashboard with charts and insights.
//
// Time range selector: Last 7 days | 30 days | 90 days | Custom
//
// Charts:
//   1. Entry Volume Trend (bar chart, daily entries)
//   2. Incident Frequency (line chart, incidents per week)
//   3. Average Response Time (supervisor alert → acknowledgment)
//   4. Risk Score Distribution (pie chart: safe/caution/prohibited)
//   5. Top 10 Highest Risk Manholes (bar chart)
//   6. Worker Performance (entries per worker, avg time, compliance rate)
//   7. Area-wise Safety Score (radar chart)
//   8. Alert Escalation Rate (% of entries that triggered alerts)
//   9. Gas Reading Trends (line chart per gas type)
//   10. PPE Compliance Rate (% of entries with full checklist)
//   11. Check-in Response Rate (% of on-time dead man's switch)
//   12. Fatigue Violations (count of shifts exceeding limits)
//   13. Maintenance Compliance (scheduled vs completed)
//   14. Grievance Resolution Time (avg days to resolve)
//
// Export: Download as PDF report or XLSX spreadsheet
```

### NEW: Compliance Reports Page (`ComplianceReportsPage.tsx`)

```typescript
// Generate official safety compliance reports for authorities.
//
// Report Types:
//   1. Daily Operations Report
//      - All entries/exits for the day
//      - Incidents and alerts
//      - PPE compliance rate
//
//   2. Monthly Safety Summary
//      - Total operations, incidents, response times
//      - Risk trends
//      - Worker hours and fatigue compliance
//      - Certification status
//
//   3. Incident Investigation Report
//      - Specific incident details
//      - Timeline of events
//      - Gas readings at time of incident
//      - Worker health check data
//      - Audit trail
//
//   4. Manhole Inspection Report
//      - Manhole condition, risk history
//      - Maintenance records
//      - Blockage history
//      - Citizen grievances
//
//   5. Annual Safety Audit Report
//      - Year-over-year trends
//      - All incidents categorized
//      - Compliance metrics
//      - Recommendations (auto-generated based on data)
//
// Output: PDF with letterhead, charts, tables
// Storage: Saved to report archive, downloadable
```

---

## 12. City Heatmap Module

```typescript
// Same as v1, PLUS:
//
// NEW layers (toggleable):
//   - Gas alert overlay: manholes with recent dangerous readings
//   - Active SOS markers: pulsing red with ambulance icon
//   - Geo-fence circles: visual radius around each manhole
//   - Nearest hospitals/fire stations: overlay layer
//   - Citizen grievance pins: where public reported issues
//   - Maintenance overdue: manholes needing service
//   - Weather overlay: storm/flood warning zones
```

---

## 13. State Machine Implementation

### UPDATED State Definitions

```typescript
enum EntryState {
  IDLE = 'IDLE',
  SCANNED = 'SCANNED',
  CHECKLIST_PENDING = 'CHECKLIST_PENDING',    // NEW
  ENTERED = 'ENTERED',
  ACTIVE = 'ACTIVE',
  EXITED = 'EXITED',
  OVERSTAY_ALERT = 'OVERSTAY_ALERT',
  SOS_TRIGGERED = 'SOS_TRIGGERED',            // NEW
  GAS_ALERT = 'GAS_ALERT',                    // NEW
  CHECKIN_MISSED = 'CHECKIN_MISSED',           // NEW
}

enum EntryEvent {
  SCAN_QR = 'SCAN_QR',
  COMPLETE_CHECKLIST = 'COMPLETE_CHECKLIST',   // NEW
  CONFIRM_ENTRY = 'CONFIRM_ENTRY',
  ACTIVATE = 'ACTIVATE',
  CONFIRM_EXIT = 'CONFIRM_EXIT',
  TRIGGER_ALERT = 'TRIGGER_ALERT',
  TRIGGER_SOS = 'TRIGGER_SOS',                // NEW
  GAS_DANGER = 'GAS_DANGER',                  // NEW
  MISS_CHECKIN = 'MISS_CHECKIN',              // NEW
  RESOLVE_CHECKIN = 'RESOLVE_CHECKIN',        // NEW
  RESOLVE_GAS = 'RESOLVE_GAS',               // NEW
  CANCEL_SOS = 'CANCEL_SOS',                 // NEW
  RESET = 'RESET',
}

// UPDATED Transition table:
const transitions = {
  IDLE:              { SCAN_QR: 'SCANNED' },
  SCANNED:           { COMPLETE_CHECKLIST: 'CHECKLIST_PENDING', RESET: 'IDLE' },
  CHECKLIST_PENDING: { CONFIRM_ENTRY: 'ENTERED', RESET: 'IDLE' },
  ENTERED:           { ACTIVATE: 'ACTIVE', RESET: 'IDLE' },
  ACTIVE: {
    CONFIRM_EXIT: 'EXITED',
    TRIGGER_ALERT: 'OVERSTAY_ALERT',
    TRIGGER_SOS: 'SOS_TRIGGERED',
    GAS_DANGER: 'GAS_ALERT',
    MISS_CHECKIN: 'CHECKIN_MISSED',
  },
  CHECKIN_MISSED: {
    RESOLVE_CHECKIN: 'ACTIVE',
    TRIGGER_SOS: 'SOS_TRIGGERED',
    CONFIRM_EXIT: 'EXITED',
  },
  GAS_ALERT: {
    CONFIRM_EXIT: 'EXITED',
    TRIGGER_SOS: 'SOS_TRIGGERED',
    RESOLVE_GAS: 'ACTIVE',
  },
  OVERSTAY_ALERT: {
    CONFIRM_EXIT: 'EXITED',
    TRIGGER_SOS: 'SOS_TRIGGERED',
    RESET: 'IDLE',
  },
  SOS_TRIGGERED: {
    CONFIRM_EXIT: 'EXITED',
    CANCEL_SOS: 'ACTIVE',
    RESET: 'IDLE',
  },
  EXITED:            { RESET: 'IDLE' },
};
```

---

## 14. Authentication & Authorization

```typescript
// Same as v1, PLUS:
//
// NEW Role: CITIZEN
//   - Can only access /api/public/* routes
//   - POST /api/public/grievance (submit issue)
//   - GET  /api/public/grievance/:trackingCode (check status)
//   - GET  /api/public/heatmap (read-only public heatmap)
//
// NEW: Certification gate
//   - Before allowing entry start, check worker has valid certifications:
//     * SAFETY_TRAINING (mandatory, cannot enter without it)
//     * CONFINED_SPACE (mandatory)
//     * MEDICAL_FITNESS (mandatory, checked annually)
//   - If any mandatory cert is expired → block entry, notify supervisor
```

---

## 15. External Integrations

### OpenMeteo Rainfall API (same as v1)

### NEW: Extended Weather Service (`weather.service.ts`)

```typescript
// Fetch comprehensive weather data from OpenMeteo:
// Endpoint: https://api.open-meteo.com/v1/forecast
// Params: latitude, longitude, hourly=temperature_2m,relative_humidity_2m,
//         precipitation,wind_speed_10m,wind_gusts_10m
//         daily=weather_code,temperature_2m_max
//
// Weather-based safety decisions:
//   - Temperature > 42°C → CAUTION (heat stroke risk)
//   - Temperature > 45°C → PROHIBITED (extreme heat)
//   - Wind > 60 km/h → CAUTION (debris risk at opening)
//   - Weather code 95-99 (thunderstorm/hail) → PROHIBITED
//   - Precipitation > 30mm forecast → PROHIBITED (flooding)
//   - Humidity > 95% + Temp > 35°C → CAUTION (heat exhaustion)
//
// Cache: 1 hour per location, refresh on demand for active entries
```

### NEW: Nearest Facility Service (`nearest-facility.service.ts`)

```typescript
// Uses Overpass API (OpenStreetMap) to find nearest:
// - Hospitals / Clinics
// - Fire stations
// - Police stations
//
// Endpoint: https://overpass-api.de/api/interpreter
// Query: [out:json]; node["amenity"="hospital"](around:{radius},{lat},{lng}); out;
//
// On manhole creation: pre-compute and store nearest facilities
// On SOS: re-query in real-time for accuracy
// Cache: 24 hours (facilities don't move often)
//
// Returns:
//   { name, distance_km, latitude, longitude, phone?, address? }
```

### NEW: Supabase Real-time (expanded channels)

```typescript
// UPDATED channels:
// 'entry-updates'    — entry_logs INSERT/UPDATE
// 'alerts'           — custom broadcast (overstay, gas, SOS)
// 'risk-updates'     — manholes UPDATE (risk_score changes)
// 'gas-readings'     — gas_readings INSERT (live sensor data)     ← NEW
// 'checkins'         — check_ins INSERT (dead man's switch)       ← NEW
// 'sos'              — sos_records INSERT (emergency)             ← NEW
// 'tasks'            — tasks INSERT/UPDATE (supervisor tasks)     ← NEW
// 'grievances'       — grievances INSERT (citizen reports)        ← NEW
```

---

## 16. Offline Mode & Background Sync

### Architecture

```typescript
// The worker PWA must function without internet connectivity.
// This is CRITICAL because workers go underground where there is no signal.
//
// ── What works offline ──
// 1. QR Scanning (camera is local)
// 2. Entry time recording (stored in IndexedDB)
// 3. Exit time recording (stored in IndexedDB)
// 4. Check-in responses (stored in IndexedDB)
// 5. SOS trigger (queued for send, plays local alarm)
// 6. PPE checklist (stored locally)
// 7. Timer countdown (runs in Service Worker)
// 8. Health check form (stored locally)
//
// ── What requires online ──
// 1. QR code lookup (manhole details) — CACHED on first scan
// 2. Risk prediction — use CACHED last-known risk level
// 3. Sending alerts to supervisor — QUEUED and sent on reconnect
// 4. Real-time dashboard updates — synced on reconnect
// 5. Gas sensor data push — QUEUED

// ── Sync Strategy ──
// 1. Every action creates a record in IndexedDB (via Dexie.js)
// 2. Service Worker monitors navigator.onLine
// 3. On reconnect: SyncEngine processes queue in FIFO order
// 4. Conflict resolution: server timestamp wins, but offline entries
//    are preserved with is_offline_entry=true flag
// 5. SOS records get HIGHEST sync priority
```

### IndexedDB Schema (Dexie.js)

```typescript
// db/dexie.ts

import Dexie from 'dexie';

class ManholeGuardDB extends Dexie {
  syncQueue!: Table<SyncQueueItem>;
  cachedManholes!: Table<CachedManhole>;
  cachedRiskLevels!: Table<CachedRisk>;
  activeEntry!: Table<LocalEntry>;
  checkInResponses!: Table<LocalCheckIn>;

  constructor() {
    super('ManholeGuardOffline');
    this.version(1).stores({
      syncQueue: '++id, action, priority, createdAt',
      cachedManholes: 'qrCodeId, area',
      cachedRiskLevels: 'manholeId, calculatedAt',
      activeEntry: 'id, workerId',
      checkInResponses: '++id, entryLogId, promptedAt',
    });
  }
}
```

### Service Worker (`sw.js`)

```typescript
// Service Worker responsibilities:
//
// 1. Cache static assets (app shell) for offline use
// 2. Cache API responses for manhole lookups (network-first, cache-fallback)
// 3. Run background sync when connectivity returns
// 4. Manage push notification display
// 5. Keep check-in timer alive even when app is backgrounded
// 6. Handle SOS in background (continue alarm, queue send)
//
// Cache strategy:
//   - Static assets: Cache-First
//   - API /scan responses: Network-First (cache last known)
//   - API /risk responses: Network-First (cache for 1 hour)
//   - Other API: Network-Only (queue offline)
//
// Background sync tags:
//   'sync-entries'    — entry start/exit
//   'sync-checkins'   — check-in responses
//   'sync-sos'        — SOS records (highest priority)
//   'sync-health'     — health check records
//   'sync-checklist'  — PPE checklists
```

---

## 17. Dead Man's Switch — Periodic Check-In

### Service: `checkin.service.ts`

```typescript
class CheckInService {

  /**
   * Called by TimerMonitor at regular intervals for each active entry.
   *
   * INTERVAL: Every CHECKIN_INTERVAL_MINUTES (default: 10 min)
   *
   * Flow:
   * 1. Send check-in prompt to worker device (push notification + in-app)
   * 2. Create CheckIn record with promptedAt = now()
   * 3. Start grace period timer (CHECKIN_GRACE_PERIOD_SECONDS)
   * 4. If worker responds within grace period:
   *    → Update respondedAt, wasOnTime = true
   *    → Log successful check-in
   * 5. If worker does NOT respond:
   *    → wasOnTime = false
   *    → Count consecutive missed check-ins for this entry
   *    → Escalate based on MISSED_CHECKIN_ALERT_THRESHOLD
   */

  async promptCheckIn(entryLogId: string): Promise<CheckIn> {
    // Create record, send push, start timer
  }

  async respondToCheckIn(checkInId: string, method: 'tap' | 'shake' | 'voice'): Promise<void> {
    // Mark responded, clear any pending alerts
  }

  async handleMissedCheckIn(entryLogId: string): Promise<void> {
    const missedCount = await this.getConsecutiveMissedCount(entryLogId);

    if (missedCount >= 3) {
      // Auto-trigger SOS — worker assumed incapacitated
      await this.alertService.triggerSOS(entry.workerId, entryLogId);
    } else if (missedCount >= MISSED_CHECKIN_ALERT_THRESHOLD) {
      // Alert supervisor
      await this.alertService.triggerMissedCheckInAlert(entry, missedCount);
    }
    // Update entry state to CHECKIN_MISSED
  }
}
```

### Why This Matters

The objectives document explicitly states the system must work even if:
- Worker **cannot press SOS**
- Worker **is unconscious**
- Worker **has no phone**
- Worker **is in a no-network area**

The dead man's switch addresses the first two scenarios. If a worker stops responding to check-ins, the system automatically assumes danger and escalates — no worker action required.

---

## 18. Pre-Entry Safety Checklist (PPE Verification)

### Service: `checklist.service.ts`

```typescript
class ChecklistService {

  /**
   * Standard PPE items for manhole entry (configurable).
   */
  static DEFAULT_ITEMS = [
    { id: 'helmet',        label: 'Safety helmet with headlamp',       mandatory: true },
    { id: 'gas_detector',  label: 'Personal gas detector',             mandatory: true },
    { id: 'harness',       label: 'Full-body safety harness + lifeline', mandatory: true },
    { id: 'gloves',        label: 'Rubber gloves (elbow-length)',      mandatory: true },
    { id: 'boots',         label: 'Gumboots (anti-slip, steel-toe)',   mandatory: true },
    { id: 'vest',          label: 'Reflective safety vest',            mandatory: true },
    { id: 'respirator',    label: 'Face mask / respirator',            mandatory: true },
    { id: 'firstaid',      label: 'First-aid kit accessible',          mandatory: true },
    { id: 'comms',         label: 'Communication device charged',      mandatory: true },
    { id: 'tripod',        label: 'Tripod and winch at opening',       mandatory: true },
    { id: 'ventilation',   label: 'Ventilation fan running',           mandatory: false },
    { id: 'supervisor',    label: 'Supervisor present at site',        mandatory: true },
  ];

  /**
   * Create checklist for an entry.
   * Entry CANNOT proceed until all mandatory items are checked.
   */
  async createChecklist(entryLogId: string, items: ChecklistItemInput[]): Promise<Checklist> {
    const allMandatoryPassed = items
      .filter(i => this.isMandatory(i.id))
      .every(i => i.checked);

    return await prisma.checklist.create({
      data: {
        entryLogId,
        items: items as any,
        allPassed: allMandatoryPassed,
        completedAt: allMandatoryPassed ? new Date() : null,
      }
    });
  }

  /**
   * Supervisor can override a specific item if justified.
   */
  async supervisorOverride(checklistId: string, supervisorId: string): Promise<void> {
    // Update supervisorApproved = true
    // Log in audit trail with supervisor ID and reason
  }
}
```

---

## 19. Gas & Environmental Sensor Integration

### Service: `gas-monitor.service.ts`

```typescript
class GasMonitorService {

  // Gas safety thresholds (from environment variables):
  static THRESHOLDS = {
    h2s:  { warning: 10,    danger: 20,   unit: 'ppm', name: 'Hydrogen Sulfide' },
    ch4:  { warning: 1000,  danger: 5000, unit: 'ppm', name: 'Methane' },
    co:   { warning: 35,    danger: 100,  unit: 'ppm', name: 'Carbon Monoxide' },
    o2:   { low: 19.5, high: 23.5,        unit: '%',   name: 'Oxygen' },
    co2:  { warning: 5000,  danger: 40000, unit: 'ppm', name: 'Carbon Dioxide' },
    nh3:  { warning: 25,    danger: 50,   unit: 'ppm', name: 'Ammonia' },
  };

  /**
   * Ingest a new gas reading from IoT sensor or manual input.
   */
  async recordReading(manholeId: string, reading: GasReadingInput): Promise<GasReading> {
    const isDangerous = this.evaluateDanger(reading);
    const record = await prisma.gasReading.create({
      data: { ...reading, manholeId, isDangerous }
    });

    if (isDangerous) {
      await this.alertService.triggerGasAlert(manholeId, record);
    }
    return record;
  }

  /**
   * Check if manhole is safe to enter based on latest readings.
   */
  async isSafeToEnter(manholeId: string): Promise<boolean> {
    const latest = await prisma.gasReading.findFirst({
      where: { manholeId },
      orderBy: { readAt: 'desc' }
    });
    if (!latest) return true; // No sensor = no data (risk engine handles this)
    if (latest.isDangerous) return false;

    // Also check if reading is stale (>2 hours old)
    const ageHours = (Date.now() - latest.readAt.getTime()) / 3600000;
    if (ageHours > 2) return true; // Stale data, allow but flag

    return !this.evaluateDanger(latest);
  }

  /**
   * API endpoint for IoT sensors to push readings.
   * POST /api/gas/reading
   * Body: { device_id, h2s, ch4, co, o2, co2, nh3, temperature, humidity }
   * Auth: Device API key (separate from user auth)
   */

  /**
   * Manual reading entry by worker with personal gas detector.
   * POST /api/gas/manual
   * Body: { manhole_id, h2s, ch4, co, o2 }
   * Auth: Worker token
   */
}
```

---

## 20. Multi-Worker / Team Entry Support

```typescript
// Some manholes allow multiple workers to enter simultaneously.
// The system tracks them as a "team entry" group.
//
// ── How it works ──
// 1. Manhole has maxWorkers field (default: 2)
// 2. First worker scans QR → starts a team entry session
// 3. Subsequent workers scan same QR → join the team entry (same teamEntryId)
// 4. Each worker gets their own EntryLog, linked by teamEntryId (UUID)
// 5. Timer is individual per worker
// 6. If ONE worker triggers alert → all team members notified
// 7. If ONE worker triggers SOS → all team members shown emergency screen
// 8. Exit is individual, but dashboard shows team grouping
//
// ── API ──
// POST /api/entry/start → auto-detects if team entry exists for this manhole
// Response includes: { teamEntryId, teamMembers: [...], position: 2 of 3 }
//
// ── Dashboard view ──
// Team entries shown as grouped rows in active entries table
// Expandable to see individual worker timers
```

---

## 21. Post-Exit Health Confirmation

### Service: `health-check.service.ts`

```typescript
class HealthCheckService {

  static SYMPTOMS = [
    { id: 'dizziness',       label: 'Dizziness / lightheadedness', serious: true },
    { id: 'nausea',          label: 'Nausea / vomiting',           serious: true },
    { id: 'breathlessness',  label: 'Difficulty breathing',        serious: true },
    { id: 'skin_irritation', label: 'Skin irritation / rash',      serious: false },
    { id: 'eye_irritation',  label: 'Eye irritation / burning',    serious: false },
    { id: 'headache',        label: 'Headache',                    serious: false },
    { id: 'chest_pain',      label: 'Chest pain / tightness',      serious: true },
    { id: 'unconscious',     label: 'Loss of consciousness',       serious: true },
    { id: 'none',            label: 'None — I feel fine',          serious: false },
  ];

  async recordHealthCheck(input: HealthCheckInput): Promise<HealthCheck> {
    const needsMedical = input.symptoms.some(s =>
      this.SYMPTOMS.find(def => def.id === s)?.serious
    );

    const record = await prisma.healthCheck.create({
      data: { ...input, needsMedical }
    });

    if (needsMedical) {
      // Alert supervisor
      // Show nearest hospital to worker
      // Create incident record (type: MEDICAL, severity based on symptoms)
      await this.alertService.sendMedicalAlert(record);
    }

    // Log in audit trail
    return record;
  }

  /**
   * Flag if a worker consistently reports symptoms → suggest reassignment.
   */
  async getWorkerHealthTrend(workerId: string, days: number = 30): Promise<HealthTrend> {
    // Query health checks for worker in date range
    // Calculate symptom frequency
    // Flag if >3 symptomatic exits in 30 days
  }
}
```

---

## 22. Worker Fatigue & Shift Management

### Service: `shift.service.ts` + `fatigue.service.ts`

```typescript
class ShiftService {
  /**
   * Start a shift when worker logs in for the day.
   */
  async startShift(workerId: string): Promise<Shift> {
    // Check if an active shift already exists
    // Create new shift record
    // Return shift with limits info
  }

  /**
   * End shift when worker logs out or shift time exceeds MAX_SHIFT_HOURS.
   */
  async endShift(shiftId: string): Promise<Shift> {
    // Calculate total underground minutes
    // Calculate fatigue score
    // Update status
  }
}

class FatigueService {

  // Configurable limits:
  static LIMITS = {
    MAX_ENTRIES_PER_SHIFT: 4,             // from env
    MAX_UNDERGROUND_MINUTES_PER_SHIFT: 120,
    MIN_REST_BETWEEN_ENTRIES_MINUTES: 15,
    MAX_SHIFT_HOURS: 10,
  };

  /**
   * Check if a worker can safely make another entry.
   */
  async canWorkerEnter(workerId: string): Promise<{ allowed: boolean; reason?: string }> {
    const shift = await this.getActiveShift(workerId);
    if (!shift) return { allowed: true }; // No shift tracking = allow

    // Check 1: Max entries per shift
    if (shift.entryCount >= this.LIMITS.MAX_ENTRIES_PER_SHIFT) {
      return { allowed: false, reason: 'MAX_ENTRIES_REACHED' };
    }

    // Check 2: Max underground time
    if (shift.totalUndergroundMinutes >= this.LIMITS.MAX_UNDERGROUND_MINUTES_PER_SHIFT) {
      return { allowed: false, reason: 'MAX_UNDERGROUND_TIME_REACHED' };
    }

    // Check 3: Minimum rest between entries
    const lastExit = await this.getLastExitTime(workerId);
    if (lastExit) {
      const restMinutes = (Date.now() - lastExit.getTime()) / 60000;
      if (restMinutes < this.LIMITS.MIN_REST_BETWEEN_ENTRIES_MINUTES) {
        return { allowed: false, reason: 'REST_REQUIRED', restRemaining: Math.ceil(this.LIMITS.MIN_REST_BETWEEN_ENTRIES_MINUTES - restMinutes) };
      }
    }

    // Check 4: Max shift hours
    const shiftHours = (Date.now() - shift.startTime.getTime()) / 3600000;
    if (shiftHours >= this.LIMITS.MAX_SHIFT_HOURS) {
      return { allowed: false, reason: 'SHIFT_EXCEEDED' };
    }

    return { allowed: true };
  }

  /**
   * Calculate fatigue score (0-100) based on multiple factors.
   */
  calculateFatigueScore(shift: Shift): number {
    const entryFactor = (shift.entryCount / this.LIMITS.MAX_ENTRIES_PER_SHIFT) * 30;
    const timeFactor = (shift.totalUndergroundMinutes / this.LIMITS.MAX_UNDERGROUND_MINUTES_PER_SHIFT) * 40;
    const shiftHours = (Date.now() - shift.startTime.getTime()) / 3600000;
    const hoursFactor = (shiftHours / this.LIMITS.MAX_SHIFT_HOURS) * 30;

    return Math.min(100, entryFactor + timeFactor + hoursFactor);
  }
}
```

---

## 23. Geo-Fence Verification

### Service: `geofence.service.ts`

```typescript
class GeoFenceService {

  /**
   * Verify worker is physically near the manhole they scanned.
   * Prevents remote/fraudulent scans.
   */
  async verifyLocation(
    manholeId: string,
    workerLat: number,
    workerLng: number
  ): Promise<GeoVerification> {
    const manhole = await prisma.manhole.findUnique({ where: { id: manholeId } });
    const distance = this.haversineDistance(
      workerLat, workerLng,
      manhole.latitude, manhole.longitude
    );

    const withinFence = distance <= (manhole.geoFenceRadius || 50);

    return {
      verified: withinFence,
      distance: Math.round(distance),
      radius: manhole.geoFenceRadius || 50,
      message: withinFence
        ? 'Location verified'
        : `You are ${Math.round(distance)}m away. Move within ${manhole.geoFenceRadius}m of the manhole.`
    };
  }

  /**
   * Haversine formula for distance between two GPS coordinates.
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Standard haversine implementation returning meters
  }
}

// ── Middleware (middleware/geoFence.ts) ──
// Applied to POST /api/entry/start
// If GEOFENCE_STRICT_MODE=true: block entry if not verified
// If GEOFENCE_STRICT_MODE=false: allow but flag geoVerified=false
```

---

## 24. Supervisor-Initiated Task Registration

### Service: `task.service.ts`

```typescript
class TaskService {
  /**
   * Supervisor creates a task BEFORE sending workers to the field.
   * This is the proper workflow per the objectives document:
   * "Before entering a manhole, the supervisor registers the task in the system."
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    // Validate: manhole exists, workers exist, workers have valid certs
    // Check risk level — warn if CAUTION, block if PROHIBITED (unless override)
    // Check weather safety
    // Create Task record
    // Notify assigned workers via push notification
    // Log in audit trail
  }

  /**
   * Link an entry to its parent task when worker starts entry.
   */
  async linkEntryToTask(entryLogId: string, taskId: string): Promise<void> {
    // Validate this worker is assigned to this task
    // Update entry_log.taskId
  }

  /**
   * Auto-complete task when all assigned workers have exited.
   */
  async checkTaskCompletion(taskId: string): Promise<void> {
    // Count active entries for this task
    // If 0 active + at least 1 completed → mark task as completed
  }
}
```

---

## 25. Emergency SOS & Nearest Facility Routing

### Service: `sos.service.ts`

```typescript
class SOSService {

  /**
   * Trigger SOS — can be called from:
   * 1. Worker pressing SOS button
   * 2. Auto-trigger after 3 missed check-ins
   * 3. Auto-trigger on gas emergency with no exit
   * 4. Supervisor manual trigger from dashboard
   */
  async triggerSOS(input: SOSTriggerInput): Promise<SOSRecord> {
    // 1. Create SOSRecord with trigger method
    // 2. Find nearest hospital
    const hospital = await this.facilityService.findNearest(
      input.latitude, input.longitude, 'hospital'
    );
    // 3. Find nearest fire station
    const fireStation = await this.facilityService.findNearest(
      input.latitude, input.longitude, 'fire_station'
    );

    // 4. Create SOS record
    const sos = await prisma.sOSRecord.create({
      data: {
        workerId: input.workerId,
        entryLogId: input.entryLogId,
        latitude: input.latitude,
        longitude: input.longitude,
        triggerMethod: input.method,
        nearestHospital: hospital.name,
        hospitalDistance: hospital.distanceKm,
        nearestFireStation: fireStation.name,
      }
    });

    // 5. Multi-channel alert blast
    //    a. Push to supervisor (CRITICAL)
    //    b. Push to all nearby workers (EVACUATE)
    //    c. SMS to supervisor
    //    d. SMS to worker's emergency contact with location link
    //    e. Email to admin with full incident details
    //    f. Dashboard: full-screen SOS overlay
    // 6. Real-time broadcast on 'sos' channel
    // 7. Create incident (severity: CRITICAL)
    // 8. Audit log

    return sos;
  }

  /**
   * Resolve SOS (supervisor/admin action).
   */
  async resolveSOS(sosId: string, outcome: string): Promise<void> {
    // outcome: 'rescued' | 'false_alarm' | 'hospitalized'
    // Update SOS record, resolve linked incident
    // Audit log
  }
}
```

---

## 26. Multi-Language Support (i18n)

```typescript
// ── Supported Languages ──
// en: English (default)
// hi: Hindi (हिन्दी)
// mr: Marathi (मराठी)
// ta: Tamil (தமிழ்)
// te: Telugu (తెలుగు)
// kn: Kannada (ಕನ್ನಡ)
//
// ── Implementation ──
// 1. Backend: i18next for notification text, error messages, report content
// 2. Worker App: react-i18next for all UI text
// 3. Dashboard: react-i18next for all UI text
// 4. Citizen Portal: react-i18next
//
// ── Translation coverage ──
// - All UI labels, buttons, headings
// - PPE checklist items
// - Risk level names
// - Alert messages
// - Health check symptoms
// - Voice alert announcements (TTS in worker's language)
// - Compliance report templates
// - Error messages
//
// ── Language selection ──
// - User.language field in DB (set during registration)
// - Worker app: language picker on login screen + settings
// - Dashboard: language picker in header
// - Citizen portal: language picker at top
//
// ── Notification language ──
// When sending push/SMS to a worker, use THEIR language preference.
// When sending to supervisor about a worker, use SUPERVISOR's language.
```

---

## 27. Compliance Report Generation

### Service: `report.service.ts`

```typescript
class ReportService {

  /**
   * Generate PDF compliance report.
   * Uses PDFKit or @react-pdf/renderer.
   */
  async generateReport(type: ReportType, params: ReportParams): Promise<Buffer> {
    switch (type) {
      case 'DAILY_OPERATIONS':
        return this.generateDailyReport(params.date);
      case 'MONTHLY_SUMMARY':
        return this.generateMonthlySummary(params.month, params.year);
      case 'INCIDENT_INVESTIGATION':
        return this.generateIncidentReport(params.incidentId);
      case 'MANHOLE_INSPECTION':
        return this.generateManholeReport(params.manholeId);
      case 'ANNUAL_AUDIT':
        return this.generateAnnualAudit(params.year);
      case 'WORKER_SAFETY_CARD':   // NEW: Individual worker safety record
        return this.generateWorkerCard(params.workerId);
    }
  }

  /**
   * Daily Operations Report includes:
   * - Total entries/exits
   * - Active manholes
   * - Incidents and alerts
   * - PPE compliance rate
   * - Check-in response rate
   * - Gas readings summary
   * - Weather conditions
   */

  /**
   * Schedule auto-generation:
   * - Daily report: auto-generated at 11 PM daily
   * - Monthly report: auto-generated on 1st of each month
   * - Stored in Supabase Storage, downloadable from dashboard
   */
}

// API:
// POST /api/reports/generate  { type, params }  → returns download URL
// GET  /api/reports            → list generated reports
// GET  /api/reports/:id/download → download PDF
```

---

## 28. Maintenance Scheduling Engine

### Service: `maintenance.service.ts`

```typescript
class MaintenanceService {

  /**
   * Auto-schedule maintenance based on risk data.
   * Runs as a daily job.
   */
  async autoSchedule(): Promise<Maintenance[]> {
    const manholes = await prisma.manhole.findMany();
    const scheduled: Maintenance[] = [];

    for (const manhole of manholes) {
      // Rule 1: Clean every 30 days if risk > CAUTION
      // Rule 2: Clean every 60 days if risk = SAFE
      // Rule 3: Sensor calibration every 90 days for equipped manholes
      // Rule 4: Structural inspection every 180 days
      // Rule 5: Immediate if blockage count > 3 in last 30 days

      const lastCleaned = manhole.lastCleanedAt;
      const daysSinceCleaned = lastCleaned
        ? (Date.now() - lastCleaned.getTime()) / 86400000
        : 999;

      const threshold = manhole.riskLevel === 'SAFE' ? 60 : 30;

      if (daysSinceCleaned > threshold) {
        const existing = await prisma.maintenance.findFirst({
          where: { manholeId: manhole.id, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } }
        });
        if (!existing) {
          scheduled.push(await prisma.maintenance.create({
            data: {
              manholeId: manhole.id,
              type: 'cleaning',
              scheduledAt: new Date(),
              autoGenerated: true,
            }
          }));
        }
      }
    }

    return scheduled;
  }

  /**
   * Mark overdue maintenance and alert supervisors.
   */
  async checkOverdue(): Promise<void> {
    // Find maintenance where scheduledAt < now() and status = 'SCHEDULED'
    // Update status to 'OVERDUE'
    // Alert relevant supervisor
  }
}
```

---

## 29. Public Grievance / Citizen Reporting Portal

### Citizen Portal App (`apps/citizen-portal/`)

```typescript
// A lightweight public-facing web app where citizens can report manhole issues.
// NO authentication required (but CAPTCHA protection).
//
// ── Report Issue Page ──
// Form:
//   - Issue Type (dropdown): Open Manhole | Overflow | Foul Smell | Blockage | Structural Damage
//   - Description (textarea, 500 char max)
//   - Location: Either pin-drop on map OR auto-detect GPS OR type address
//   - Photos: Upload up to 3 images (compressed client-side)
//   - Reporter Name (required)
//   - Reporter Phone (required)
//   - Reporter Email (optional)
//   - CAPTCHA
//
// On submit:
//   - Generate unique tracking code (format: MHG-2026-XXXXX)
//   - Try to match to nearest known manhole (within 100m)
//   - Store in grievances table
//   - Auto-assign to area supervisor
//   - SMS confirmation to reporter with tracking code
//
// ── Track Status Page ──
//   - Enter tracking code → see current status
//   - Timeline: Submitted → Under Review → In Progress → Resolved
//   - No login needed (tracking code is the auth)
//
// ── Public Heatmap Page ──
//   - Read-only version of the heatmap
//   - Shows risk zones (no worker details)
//   - Shows resolved grievance count per area
```

### Grievance API

```typescript
// POST /api/public/grievance          → submit new grievance (no auth)
// GET  /api/public/grievance/:code    → track by code (no auth)
// GET  /api/public/heatmap            → public heatmap data (no auth)
//
// GET  /api/grievances                → list all (supervisor+)
// PUT  /api/grievances/:id/assign     → assign to team (supervisor+)
// PUT  /api/grievances/:id/resolve    → mark resolved (supervisor+)
// PUT  /api/grievances/:id/status     → update status (supervisor+)
```

---

## 30. Worker Training & Certification Tracking

### Service: `certification.service.ts`

```typescript
class CertificationService {

  static REQUIRED_CERTS: CertificationType[] = [
    'SAFETY_TRAINING',
    'CONFINED_SPACE',
    'MEDICAL_FITNESS',
  ];

  /**
   * Check if worker has all required valid certifications.
   */
  async hasValidCerts(workerId: string): Promise<boolean> {
    const certs = await prisma.workerCertification.findMany({
      where: { workerId, isValid: true, expiresAt: { gt: new Date() } }
    });
    return this.REQUIRED_CERTS.every(req =>
      certs.some(c => c.type === req)
    );
  }

  /**
   * Get expiring certifications (next N days).
   */
  async getExpiring(days: number = 30): Promise<WorkerCertification[]> {
    const cutoff = new Date(Date.now() + days * 86400000);
    return prisma.workerCertification.findMany({
      where: { isValid: true, expiresAt: { lte: cutoff } },
      include: { worker: true },
    });
  }

  /**
   * Daily job: check for expiring certs and alert supervisors.
   */
  async checkExpiringCerts(): Promise<void> {
    // Certs expiring in 30 days → info alert
    // Certs expiring in 7 days → warning alert
    // Certs expired today → mark isValid=false, alert supervisor, block worker entry
  }
}
```

---

## 31. Audit Trail & Tamper-Proof Logging

### Service: `audit.service.ts`

```typescript
class AuditService {

  /**
   * Create an audit log entry with hash chain integrity.
   * Each entry's hash includes the previous entry's hash,
   * creating a tamper-evident chain.
   */
  async log(input: AuditLogInput): Promise<AuditLog> {
    const lastLog = await prisma.auditLog.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { id: true, hashChain: true }
    });

    const payload = JSON.stringify({
      previousHash: lastLog?.hashChain || 'GENESIS',
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    });

    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    return prisma.auditLog.create({
      data: {
        ...input,
        hashChain: hash,
      }
    });
  }

  /**
   * Verify audit trail integrity.
   * Used in compliance audits to prove no records were tampered.
   */
  async verifyIntegrity(from?: Date, to?: Date): Promise<IntegrityReport> {
    // Fetch all logs in range
    // Recompute hashes
    // Compare with stored hashes
    // Return: { valid: boolean, checkedCount: number, brokenAt?: id }
  }
}

// ── Middleware (middleware/auditLog.ts) ──
// Automatically creates audit log for all mutating API requests.
// Captures: userId, action, entity, old value, new value, IP, user-agent
```

---

## 32. Voice & Audio Alert System

### Service: `voice-alert.service.ts`

```typescript
// Workers underground may not be looking at their phone screen.
// Voice and audio alerts ensure they receive critical information.
//
// ── Audio Alerts (Worker App) ──
// 1. Check-in beep: Short beep every CHECKIN_INTERVAL to prompt response
// 2. Warning alarm: Escalating tone when approaching time limit
// 3. SOS siren: Continuous loud alarm during emergency
// 4. Gas alert: Distinct evacuation alarm pattern
//
// ── Voice Announcements (Web Speech API / TTS) ──
// 1. On entry: "Entry confirmed. You have {X} minutes. Stay safe."
// 2. On check-in: "Please confirm you are safe."
// 3. On 80% time: "Warning. You have {X} minutes remaining."
// 4. On overstay: "Your time has exceeded. Please exit immediately."
// 5. On gas alert: "Danger! Toxic gas detected. Evacuate now!"
// 6. On SOS: "Emergency alert activated. Help is on the way."
//
// ── Language ──
// All voice announcements use the worker's preferred language.
// Pre-generated audio files for common phrases (faster than TTS).
// Fallback to Web Speech API for dynamic content.
//
// ── Implementation ──
// Worker App hook: useAudioAlert.ts
//   - playBeep(type: 'checkin' | 'warning' | 'sos' | 'gas')
//   - speak(message: string, language: string)
//   - Uses Web Audio API for beeps, Web Speech API for voice
//   - Volume: maximum (override device settings if possible)
//   - Vibration: accompany all audio with vibration patterns
```

---

## 33. Advanced Analytics & Reporting Module

### Service: `analytics.service.ts`

```typescript
class AnalyticsService {

  /**
   * Dashboard analytics queries.
   */

  async getOverviewStats(dateRange: DateRange): Promise<OverviewStats> {
    // Total entries, exits, incidents, alerts
    // PPE compliance rate
    // Check-in response rate
    // Average entry duration
    // Alert response time (supervisor)
    // Risk distribution
  }

  async getWorkerPerformance(dateRange: DateRange): Promise<WorkerPerformance[]> {
    // Per worker: entries, avg time, alerts, compliance score
    // Rank workers by safety score
  }

  async getAreaSafety(dateRange: DateRange): Promise<AreaSafety[]> {
    // Per area: avg risk score, incident rate, maintenance compliance
    // Identify trending-dangerous areas
  }

  async getPredictiveInsights(): Promise<Insight[]> {
    // Based on historical data, predict:
    // - Manholes likely to become PROHIBITED in next 30 days
    // - Workers at risk of fatigue violations
    // - Areas likely to see incident spikes (seasonal patterns)
    // - Maintenance that will become overdue
    // Simple ML: linear regression on historical risk scores
  }

  async getGrievanceAnalytics(dateRange: DateRange): Promise<GrievanceStats> {
    // Submission rate, resolution time, by area, by type
    // Unresolved grievance aging
  }

  async getResponseTimeAnalytics(dateRange: DateRange): Promise<ResponseTimeStats> {
    // Alert → acknowledgment time distribution
    // SOS → response time
    // Check-in miss → alert time
  }
}
```

---

## 34. Weather Alert System (Beyond Rainfall)

### Service: `weather.service.ts`

```typescript
class WeatherAlertService {

  /**
   * Check weather conditions and issue safety alerts.
   * Runs every 2 hours as a scheduled job.
   */
  async checkWeatherAlerts(): Promise<WeatherAlert[]> {
    const areas = await prisma.manhole.findMany({
      distinct: ['area'],
      select: { area: true, latitude: true, longitude: true }
    });

    const alerts: WeatherAlert[] = [];

    for (const area of areas) {
      const weather = await this.fetchWeather(area.latitude, area.longitude);

      // Check conditions:
      if (weather.weatherCode >= 95) {
        alerts.push({ area: area.area, type: 'THUNDERSTORM', severity: 'HIGH',
          message: 'Thunderstorm warning. All outdoor operations should be suspended.' });
      }
      if (weather.precipitation24h > 30) {
        alerts.push({ area: area.area, type: 'FLOOD_RISK', severity: 'HIGH',
          message: 'Heavy rainfall expected. Manholes may flood. Avoid entry.' });
      }
      if (weather.tempMax > 42) {
        alerts.push({ area: area.area, type: 'EXTREME_HEAT', severity: 'MEDIUM',
          message: 'Extreme heat warning. Reduce underground time. Ensure hydration.' });
      }
      if (weather.windSpeed > 60) {
        alerts.push({ area: area.area, type: 'HIGH_WIND', severity: 'MEDIUM',
          message: 'High wind advisory. Secure equipment at manhole openings.' });
      }
    }

    // For HIGH severity alerts:
    //   - Update affected manholes to PROHIBITED
    //   - Alert all supervisors in affected areas
    //   - Show banner on dashboard
    //   - Block new entries in affected areas

    return alerts;
  }
}
```

---

## 35. Testing Strategy

### Unit Tests (Vitest)

```typescript
// All tests from v1, PLUS:
//
// tests/services/checkin.test.ts
//   - Test check-in prompt timing
//   - Test missed check-in escalation (1, 2, 3 misses)
//   - Test auto-SOS after 3 missed
//
// tests/services/fatigue.test.ts
//   - Test max entries per shift
//   - Test max underground minutes
//   - Test minimum rest between entries
//   - Test max shift hours
//   - Test fatigue score calculation
//
// tests/services/geofence.test.ts
//   - Test within radius
//   - Test outside radius
//   - Test haversine accuracy
//   - Test edge cases (equator, poles, date line)
//
// tests/services/gas-monitor.test.ts
//   - Test each gas threshold (warning/danger)
//   - Test combined dangerous readings
//   - Test stale readings
//   - Test isSafeToEnter with various conditions
//
// tests/services/checklist.test.ts
//   - Test all mandatory items checked → pass
//   - Test missing mandatory item → fail
//   - Test supervisor override
//
// tests/services/health-check.test.ts
//   - Test serious symptom detection
//   - Test medical alert trigger
//   - Test health trend analysis
//
// tests/services/certification.test.ts
//   - Test valid cert check
//   - Test expired cert blocking
//   - Test expiring cert alerts
//
// tests/services/sos.test.ts
//   - Test SOS creation
//   - Test nearest facility lookup
//   - Test multi-channel alert dispatch
//
// tests/services/audit.test.ts
//   - Test hash chain creation
//   - Test integrity verification
//   - Test tamper detection
//
// tests/services/risk-engine.test.ts (UPDATED)
//   - Test new weights (gas_factor, weather_factor)
//   - Test canWorkerEnter combined clearance
//
// tests/state-machine.test.ts (UPDATED)
//   - Test all new states and transitions
//   - Test SOS from any active state
//   - Test gas alert transitions
//   - Test check-in missed → resolved → active
```

### Integration Tests

```typescript
// tests/integration/full-workflow-v2.test.ts
//
// Extended flow:
// 1. Supervisor creates task
// 2. Worker scans QR → geo-fence verified
// 3. Worker completes PPE checklist
// 4. Risk prediction (with gas + weather factors)
// 5. Entry start → timer + check-in scheduler active
// 6. Check-in #1 → responded on time
// 7. Check-in #2 → missed → alert to supervisor
// 8. Worker exits
// 9. Health check completed (symptoms reported)
// 10. Medical alert triggered
// 11. Task auto-completed
// 12. Shift fatigue score updated
// 13. Audit trail verified
// 14. Daily report generated
```

---

## 36. Deployment & DevOps

### Docker Configuration (UPDATED)

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: manholeguard
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:                          # NEW: For BullMQ
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/manholeguard
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      - postgres
      - redis

  dashboard:
    build:
      context: .
      dockerfile: apps/dashboard/Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - api

  worker-app:
    build:
      context: .
      dockerfile: apps/worker-app/Dockerfile
    ports:
      - "3001:80"
    depends_on:
      - api

  citizen-portal:                  # NEW
    build:
      context: .
      dockerfile: apps/citizen-portal/Dockerfile
    ports:
      - "3002:80"
    depends_on:
      - api

volumes:
  pgdata:
```

---

## 37. Complete API Reference

### All v1 Endpoints (same as before) PLUS:

### NEW: Pre-Entry Safety

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| POST   | `/api/entry/clearance`       | `{ worker_id, manhole_id }`        | `{ allowed, reason?, risk? }`    | Worker+     |
| POST   | `/api/checklist`             | `{ entry_log_id, items[] }`        | `{ checklist }`                  | Worker+     |
| POST   | `/api/checklist/:id/override`| `{ reason }`                        | `{ checklist }`                  | Supervisor+ |

### NEW: Dead Man's Switch

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| POST   | `/api/checkin/respond`       | `{ checkin_id, method }`           | `{ checkin }`                    | Worker+     |
| GET    | `/api/checkin/entry/:id`     | —                                   | `{ checkins[] }`                 | Supervisor+ |

### NEW: Gas Sensor

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| POST   | `/api/gas/reading`           | `{ device_id, h2s, ch4, co, o2 }` | `{ reading }`                    | Device Key  |
| POST   | `/api/gas/manual`            | `{ manhole_id, h2s, ch4, co, o2 }`| `{ reading }`                    | Worker+     |
| GET    | `/api/gas/manhole/:id`       | `?hours=24`                         | `{ readings[] }`                 | Supervisor+ |
| GET    | `/api/gas/alerts`            | —                                   | `{ dangerousReadings[] }`        | Supervisor+ |

### NEW: Health Check

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| POST   | `/api/health/check`          | `{ entry_log_id, feeling_ok, symptoms[], photo? }` | `{ healthCheck }` | Worker+     |
| GET    | `/api/health/worker/:id`     | `?days=30`                          | `{ checks[], trend }`           | Supervisor+ |

### NEW: Shift & Fatigue

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| POST   | `/api/shift/start`           | `{ worker_id }`                    | `{ shift }`                      | Worker+     |
| POST   | `/api/shift/end`             | `{ shift_id }`                     | `{ shift }`                      | Worker+     |
| GET    | `/api/shift/active`          | —                                   | `{ shift }`                      | Worker+     |
| GET    | `/api/shift/fatigue/:workerId` | —                                 | `{ canEnter, fatigueScore, limits }` | Worker+ |

### NEW: Task Registration

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| POST   | `/api/tasks`                 | `{ manhole_id, worker_ids[], type, duration, priority }` | `{ task }` | Supervisor+ |
| GET    | `/api/tasks`                 | `?status&supervisor_id`             | `{ tasks[] }`                    | Supervisor+ |
| PUT    | `/api/tasks/:id`             | `{ status? }`                       | `{ task }`                       | Supervisor+ |

### NEW: SOS

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| POST   | `/api/sos/trigger`           | `{ worker_id, entry_log_id?, lat?, lng?, method }` | `{ sosRecord }` | Worker+     |
| POST   | `/api/sos/:id/resolve`       | `{ outcome }`                       | `{ sosRecord }`                  | Supervisor+ |
| GET    | `/api/sos/active`            | —                                   | `{ sosRecords[] }`               | Supervisor+ |

### NEW: Certifications

| Method | Endpoint                      | Body/Params                        | Response                          | Auth        |
|--------|-------------------------------|-------------------------------------|-----------------------------------|-------------|
| GET    | `/api/certifications`         | `?worker_id&expiring_days=30`      | `{ certs[] }`                    | Supervisor+ |
| POST   | `/api/certifications`         | `{ worker_id, type, issued_at, expires_at, document? }` | `{ cert }` | Admin  |
| DELETE | `/api/certifications/:id`     | —                                   | `{ success }`                    | Admin       |

### NEW: Maintenance

| Method | Endpoint                      | Body/Params                        | Response                          | Auth        |
|--------|-------------------------------|-------------------------------------|-----------------------------------|-------------|
| GET    | `/api/maintenance`            | `?status&manhole_id`               | `{ maintenances[] }`             | Supervisor+ |
| POST   | `/api/maintenance`            | `{ manhole_id, type, scheduled_at }` | `{ maintenance }`             | Supervisor+ |
| PUT    | `/api/maintenance/:id`        | `{ status }`                        | `{ maintenance }`                | Supervisor+ |
| POST   | `/api/maintenance/auto-schedule` | —                                | `{ scheduled[] }`                | Admin       |

### NEW: Grievance (Public)

| Method | Endpoint                          | Body/Params                   | Response                   | Auth     |
|--------|-----------------------------------|-------------------------------|----------------------------|----------|
| POST   | `/api/public/grievance`           | `{ type, description, lat, lng, photos[], name, phone }` | `{ trackingCode }` | None |
| GET    | `/api/public/grievance/:code`     | —                             | `{ grievance, timeline }` | None     |
| GET    | `/api/public/heatmap`             | —                             | `{ heatPoints[] }`        | None     |

### NEW: Reports

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| POST   | `/api/reports/generate`      | `{ type, params }`                 | `{ reportId, downloadUrl }`      | Supervisor+ |
| GET    | `/api/reports`               | `?type&from&to`                     | `{ reports[] }`                  | Supervisor+ |
| GET    | `/api/reports/:id/download`  | —                                   | PDF file                          | Supervisor+ |

### NEW: Analytics

| Method | Endpoint                       | Body/Params                       | Response                          | Auth        |
|--------|--------------------------------|-------------------------------------|-----------------------------------|-------------|
| GET    | `/api/analytics/overview`      | `?from&to`                         | `{ stats }`                      | Supervisor+ |
| GET    | `/api/analytics/workers`       | `?from&to`                         | `{ performance[] }`              | Supervisor+ |
| GET    | `/api/analytics/areas`         | `?from&to`                         | `{ areaSafety[] }`               | Supervisor+ |
| GET    | `/api/analytics/predictions`   | —                                   | `{ insights[] }`                 | Admin       |
| GET    | `/api/analytics/response-times`| `?from&to`                         | `{ responseStats }`              | Supervisor+ |

### NEW: Audit

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| GET    | `/api/audit`                 | `?action&entity_type&user_id&from&to&page` | `{ logs[], total }`       | Admin       |
| GET    | `/api/audit/verify`          | `?from&to`                          | `{ valid, checked, brokenAt? }` | Admin       |

### NEW: Offline Sync

| Method | Endpoint                     | Body/Params                         | Response                          | Auth        |
|--------|------------------------------|-------------------------------------|-----------------------------------|-------------|
| POST   | `/api/sync/push`             | `{ actions[] }`                    | `{ synced[], conflicts[] }`      | Worker+     |
| GET    | `/api/sync/pull`             | `?since=timestamp`                  | `{ updates[] }`                  | Worker+     |

---

## 38. Error Handling & Logging

### UPDATED Error Codes (all v1 codes plus):

```typescript
const ErrorCodes = {
  // ... v1 codes ...

  // NEW: Safety
  GEO_FENCE_VIOLATION: 'GEO_FENCE_VIOLATION',
  CHECKLIST_INCOMPLETE: 'CHECKLIST_INCOMPLETE',
  CERTS_EXPIRED: 'CERTS_EXPIRED',
  CERTS_MISSING: 'CERTS_MISSING',
  FATIGUE_LIMIT_REACHED: 'FATIGUE_LIMIT_REACHED',
  REST_REQUIRED: 'REST_REQUIRED',
  GAS_UNSAFE: 'GAS_UNSAFE',
  WEATHER_UNSAFE: 'WEATHER_UNSAFE',
  MANHOLE_FULL: 'MANHOLE_FULL',
  SHIFT_EXCEEDED: 'SHIFT_EXCEEDED',

  // NEW: SOS
  SOS_ALREADY_ACTIVE: 'SOS_ALREADY_ACTIVE',

  // NEW: Grievance
  INVALID_TRACKING_CODE: 'INVALID_TRACKING_CODE',
  GRIEVANCE_ALREADY_RESOLVED: 'GRIEVANCE_ALREADY_RESOLVED',

  // NEW: Sync
  SYNC_CONFLICT: 'SYNC_CONFLICT',

  // NEW: Audit
  AUDIT_INTEGRITY_BROKEN: 'AUDIT_INTEGRITY_BROKEN',
} as const;
```

---

## 39. Performance & Scalability

### UPDATED Caching Strategy

```typescript
// All v1 caching PLUS:
//
// 5. Gas readings (latest per manhole): TTL 2 min, key = gas:latest:{manholeId}
// 6. Weather data: TTL 1 hour, key = weather:{lat}:{lng}
// 7. Nearest facilities: TTL 24 hours, key = facility:{manholeId}
// 8. Worker certifications: TTL 1 hour, key = certs:{workerId}
//    Invalidated on: cert create/delete/expiry
// 9. Fatigue check: TTL 1 min, key = fatigue:{workerId}
//    Invalidated on: entry start/exit
// 10. Analytics queries: TTL 5 min (expensive queries)
```

### BullMQ Queues

```typescript
// Queue: 'reports'
//   - Report generation (PDFs are slow, offload to background)
//   - Retry: 3 attempts, exponential backoff
//
// Queue: 'notifications'
//   - SMS dispatch (external API, may fail)
//   - Email dispatch
//   - Retry: 5 attempts
//
// Queue: 'scheduled-jobs'
//   - Risk recalculation (every 6h)
//   - Cert expiry check (daily)
//   - Maintenance overdue check (daily)
//   - Weather alerts (every 2h)
//   - Auto-report generation (daily/monthly)
```

---

## Appendix A: Zod Validation Schemas

```typescript
// All v1 schemas PLUS:

// validators/checklist.validator.ts
const checklistSchema = z.object({
  entry_log_id: z.string().uuid(),
  items: z.array(z.object({
    id: z.string(),
    checked: z.boolean(),
    photoUrl: z.string().url().optional(),
  })).min(1),
});

// validators/gas.validator.ts
const gasReadingSchema = z.object({
  device_id: z.string().optional(),
  manhole_id: z.string().uuid().optional(),
  h2s: z.number().min(0).max(1000),
  ch4: z.number().min(0).max(100000),
  co: z.number().min(0).max(5000),
  o2: z.number().min(0).max(100),
  co2: z.number().min(0).max(100000).optional(),
  nh3: z.number().min(0).max(500).optional(),
  temperature: z.number().min(-50).max(80).optional(),
  humidity: z.number().min(0).max(100).optional(),
});

// validators/health.validator.ts
const healthCheckSchema = z.object({
  entry_log_id: z.string().uuid(),
  feeling_ok: z.boolean(),
  symptoms: z.array(z.enum([
    'dizziness', 'nausea', 'breathlessness', 'skin_irritation',
    'eye_irritation', 'headache', 'chest_pain', 'unconscious', 'none'
  ])),
  notes: z.string().max(500).optional(),
});

// validators/grievance.validator.ts
const grievanceSchema = z.object({
  issue_type: z.enum(['open_manhole', 'overflow', 'foul_smell', 'blockage', 'structural_damage']),
  description: z.string().min(10).max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(500).optional(),
  reporter_name: z.string().min(1).max(100),
  reporter_phone: z.string().min(10).max(15),
  reporter_email: z.string().email().optional(),
});

// validators/task.validator.ts
const taskSchema = z.object({
  manhole_id: z.string().uuid(),
  assigned_worker_ids: z.array(z.string().uuid()).min(1).max(5),
  task_type: z.enum(['cleaning', 'inspection', 'repair', 'emergency']),
  allowed_duration: z.number().int().min(5).max(480).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  scheduled_at: z.string().datetime().optional(),
  description: z.string().max(500).optional(),
});

// validators/sos.validator.ts
const sosSchema = z.object({
  worker_id: z.string().uuid(),
  entry_log_id: z.string().uuid().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  method: z.enum(['button', 'missed_checkin', 'gas_alert', 'auto', 'supervisor']),
});
```

---

## Appendix B: Shared Types

```typescript
// Same as v1 PLUS:

export interface EntryClearanceResult {
  allowed: boolean;
  reason?: string;
  risk?: RiskPrediction;
  checks: {
    riskLevel: { passed: boolean; value: string };
    certifications: { passed: boolean; missing?: string[] };
    fatigue: { passed: boolean; score?: number; reason?: string };
    gasLevels: { passed: boolean; latestReading?: GasReading };
    weather: { passed: boolean; alerts?: string[] };
    capacity: { passed: boolean; current: number; max: number };
    geoFence: { passed: boolean; distance?: number };
  };
}

export interface ShiftSummary {
  id: string;
  workerId: string;
  startTime: string;
  endTime?: string;
  entryCount: number;
  totalUndergroundMinutes: number;
  fatigueScore: number;
  status: ShiftStatus;
  limits: {
    maxEntries: number;
    maxMinutes: number;
    maxHours: number;
    minRest: number;
  };
}
```

---

## Appendix C: Quick Start Commands

```bash
# 1. Clone and install
git clone <repo>
cd manholeguard
npm install

# 2. Start infrastructure
docker-compose up -d postgres redis

# 3. Setup database
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start backend
npm run dev    # runs on :4000

# 5. Start dashboard (new terminal)
cd apps/dashboard
npm run dev    # runs on :3000

# 6. Start worker app (new terminal)
cd apps/worker-app
npm run dev    # runs on :3001

# 7. Start citizen portal (new terminal)
cd apps/citizen-portal
npm run dev    # runs on :3002
```

---

## Appendix D: Implementation Priority Order

When implementing, follow this order:

### Phase 1: Core Safety (MVP)
1. **Database schema + seed data** — Foundation
2. **Backend API skeleton** — Express app, routes, middleware
3. **Risk Engine (v2 with gas + weather)** — Core prediction
4. **Entry management** (start/exit) — Basic workflow
5. **Pre-entry clearance gate** — Combined safety check
6. **PPE Checklist** — Mandatory before entry
7. **Timer Monitor** — Background safety monitor
8. **Dead Man's Switch (check-ins)** — Automatic worker monitoring
9. **Alert Engine (with SOS)** — Automated safety response
10. **State Machine (v2)** — Entry lifecycle integrity

### Phase 2: Worker App
11. **Worker App — QR Scanner + Geo-fence**
12. **Worker App — Checklist Page**
13. **Worker App — Active Session + Check-in Prompt**
14. **Worker App — SOS Button**
15. **Worker App — Post-Exit Health Check**
16. **Worker App — Offline Mode**
17. **Worker App — Voice/Audio Alerts**
18. **Worker App — i18n**

### Phase 3: Dashboard
19. **Auth + Authorization** — Secure all endpoints
20. **Dashboard — Active Entries (with team view)**
21. **Dashboard — Alerts Panel (with SOS)**
22. **Dashboard — Task Registration**
23. **Dashboard — Heatmap (with all layers)**
24. **Dashboard — Gas Readings Panel**
25. **Dashboard — i18n**

### Phase 4: Platform Features
26. **Shift & Fatigue Management**
27. **Worker Certifications**
28. **Maintenance Scheduling**
29. **Compliance Report Generation**
30. **Advanced Analytics**
31. **Audit Trail**

### Phase 5: Public & Polish
32. **Citizen Grievance Portal**
33. **Weather Alert System**
34. **Real-time subscriptions (all channels)**
35. **Testing — Unit + Integration**
36. **Docker + Deployment**

---

**END OF IMPLEMENTATION SPECIFICATION (v2.0)**
