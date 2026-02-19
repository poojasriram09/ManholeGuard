import dotenv from 'dotenv';
dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:4000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  // Firebase (FIREBASE_SERVICE_ACCOUNT_KEY is read directly by firebase-admin.ts)
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',

  // Cron secret (for securing /api/cron endpoints — set in cron-job.org as header)
  CRON_SECRET: process.env.CRON_SECRET || 'dev-cron-secret',

  // External APIs
  OPENMETEO_BASE_URL: process.env.OPENMETEO_BASE_URL || 'https://api.open-meteo.com/v1/forecast',

  // Alert Config
  ALERT_CHECK_INTERVAL_MS: parseInt(process.env.ALERT_CHECK_INTERVAL_MS || '30000', 10),
  DEFAULT_ALLOWED_DURATION_MINUTES: parseInt(process.env.DEFAULT_ALLOWED_DURATION_MINUTES || '45', 10),
  ALERT_SMS_ENABLED: process.env.ALERT_SMS_ENABLED === 'true',
  ALERT_EMAIL_ENABLED: process.env.ALERT_EMAIL_ENABLED !== 'false',

  // Dead Man's Switch
  CHECKIN_INTERVAL_MINUTES: parseInt(process.env.CHECKIN_INTERVAL_MINUTES || '10', 10),
  CHECKIN_GRACE_PERIOD_SECONDS: parseInt(process.env.CHECKIN_GRACE_PERIOD_SECONDS || '60', 10),
  MISSED_CHECKIN_ALERT_THRESHOLD: parseInt(process.env.MISSED_CHECKIN_ALERT_THRESHOLD || '2', 10),

  // Geo-Fence
  GEOFENCE_RADIUS_METERS: parseInt(process.env.GEOFENCE_RADIUS_METERS || '50', 10),
  GEOFENCE_STRICT_MODE: process.env.GEOFENCE_STRICT_MODE !== 'false',

  // Fatigue Limits
  MAX_ENTRIES_PER_SHIFT: parseInt(process.env.MAX_ENTRIES_PER_SHIFT || '4', 10),
  MAX_UNDERGROUND_MINUTES_PER_SHIFT: parseInt(process.env.MAX_UNDERGROUND_MINUTES_PER_SHIFT || '120', 10),
  MIN_REST_BETWEEN_ENTRIES_MINUTES: parseInt(process.env.MIN_REST_BETWEEN_ENTRIES_MINUTES || '15', 10),
  MAX_SHIFT_HOURS: parseInt(process.env.MAX_SHIFT_HOURS || '10', 10),

  // Gas Thresholds
  GAS_H2S_WARNING: parseFloat(process.env.GAS_H2S_WARNING || '10'),
  GAS_H2S_DANGER: parseFloat(process.env.GAS_H2S_DANGER || '20'),
  GAS_CH4_WARNING: parseFloat(process.env.GAS_CH4_WARNING || '1000'),
  GAS_CH4_DANGER: parseFloat(process.env.GAS_CH4_DANGER || '5000'),
  GAS_CO_WARNING: parseFloat(process.env.GAS_CO_WARNING || '35'),
  GAS_CO_DANGER: parseFloat(process.env.GAS_CO_DANGER || '100'),
  GAS_O2_LOW: parseFloat(process.env.GAS_O2_LOW || '19.5'),
  GAS_O2_HIGH: parseFloat(process.env.GAS_O2_HIGH || '23.5'),

  // SMS
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'msg91',
  SMS_API_KEY: process.env.SMS_API_KEY || '',
  SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'MHGARD',
  SMS_TEMPLATE_ID: process.env.SMS_TEMPLATE_ID || '',

  // Push Notifications
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:admin@manholeguard.in',


  // Reports
  REPORT_STORAGE_PATH: process.env.REPORT_STORAGE_PATH || '/tmp/reports',
  COMPLIANCE_REPORT_RETENTION_DAYS: parseInt(process.env.COMPLIANCE_REPORT_RETENTION_DAYS || '365', 10),

  // Citizen Portal
  CITIZEN_PORTAL_URL: process.env.CITIZEN_PORTAL_URL || 'http://localhost:3002',
  GRIEVANCE_AUTO_CLOSE_DAYS: parseInt(process.env.GRIEVANCE_AUTO_CLOSE_DAYS || '30', 10),
} as const;
