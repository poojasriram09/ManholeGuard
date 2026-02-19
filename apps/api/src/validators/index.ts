import { z } from 'zod';

// Auth
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['WORKER', 'SUPERVISOR', 'ADMIN', 'CITIZEN']).default('WORKER'),
  language: z.string().default('en'),
});

// Entry
export const scanSchema = z.object({
  qrCodeId: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const entryStartSchema = z.object({
  workerId: z.string().uuid(),
  manholeId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const entryClearanceSchema = z.object({
  workerId: z.string().uuid(),
  manholeId: z.string().uuid(),
});

// Checklist
export const checklistItemSchema = z.object({
  id: z.string(),
  checked: z.boolean(),
  photoUrl: z.string().url().optional(),
});

export const checklistSchema = z.object({
  entryLogId: z.string().uuid(),
  items: z.array(checklistItemSchema),
});

export const checklistOverrideSchema = z.object({
  reason: z.string().min(1),
});

// Check-in
export const checkInResponseSchema = z.object({
  checkInId: z.string().uuid(),
  method: z.enum(['tap', 'shake', 'voice']).default('tap'),
});

// Gas Reading
export const gasReadingSchema = z.object({
  manholeId: z.string().uuid(),
  h2s: z.number().min(0).default(0),
  ch4: z.number().min(0).default(0),
  co: z.number().min(0).default(0),
  o2: z.number().min(0).max(100).default(20.9),
  co2: z.number().min(0).default(0),
  nh3: z.number().min(0).default(0),
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  source: z.enum(['sensor', 'manual']).default('manual'),
});

// Health Check
export const healthCheckSchema = z.object({
  entryLogId: z.string().uuid(),
  feelingOk: z.boolean(),
  symptoms: z.array(z.string()).default([]),
  photoUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

// Shift
export const shiftStartSchema = z.object({
  workerId: z.string().uuid(),
});

// Task
export const taskCreateSchema = z.object({
  manholeId: z.string().uuid().optional(),
  assignedWorkerIds: z.array(z.string().uuid()).min(1),
  taskType: z.enum(['cleaning', 'inspection', 'repair', 'emergency']),
  description: z.string().optional(),
  allowedDuration: z.number().int().min(10).max(480).default(45),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  scheduledAt: z.string().datetime().optional(),
});

export const taskUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
});

// SOS
export const sosTriggerSchema = z.object({
  workerId: z.string().uuid(),
  entryLogId: z.string().uuid().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  method: z.enum(['button', 'missed_checkin', 'gas_alert', 'auto']).default('button'),
});

export const sosResolveSchema = z.object({
  outcome: z.enum(['rescued', 'false_alarm', 'hospitalized']),
});

// Grievance
export const grievanceCreateSchema = z.object({
  reporterName: z.string().min(1),
  reporterPhone: z.string().min(10),
  reporterEmail: z.string().email().optional(),
  issueType: z.enum(['open_manhole', 'overflow', 'foul_smell', 'blockage', 'structural_damage']),
  description: z.string().min(10),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  photoUrls: z.array(z.string().url()).max(3).default([]),
});

// Certification
export const certificationCreateSchema = z.object({
  workerId: z.string().uuid(),
  type: z.enum(['SAFETY_TRAINING', 'CONFINED_SPACE', 'FIRST_AID', 'GAS_DETECTION', 'PPE_USAGE', 'MEDICAL_FITNESS']),
  certificateNumber: z.string().optional(),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  issuedBy: z.string().optional(),
  documentUrl: z.string().url().optional(),
});

// Maintenance
export const maintenanceCreateSchema = z.object({
  manholeId: z.string().uuid(),
  type: z.enum(['cleaning', 'structural', 'sensor_calibration']),
  scheduledAt: z.string().datetime(),
  assignedTeam: z.string().optional(),
  notes: z.string().optional(),
});

export const maintenanceUpdateSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
});

// Report
export const reportGenerateSchema = z.object({
  type: z.enum(['DAILY_OPERATIONS', 'MONTHLY_SUMMARY', 'INCIDENT_INVESTIGATION', 'MANHOLE_INSPECTION', 'ANNUAL_AUDIT', 'WORKER_SAFETY_CARD']),
  params: z.record(z.unknown()).default({}),
});

// Manhole
export const manholeCreateSchema = z.object({
  qrCodeId: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  area: z.string().min(1),
  address: z.string().optional(),
  depth: z.number().optional(),
  diameter: z.number().optional(),
  maxWorkers: z.number().int().min(1).default(2),
  geoFenceRadius: z.number().min(10).default(50),
  hasGasSensor: z.boolean().default(false),
  sensorDeviceId: z.string().optional(),
});

// Worker
export const workerCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  employeeId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(10),
  supervisorId: z.string().uuid().optional(),
  dateOfBirth: z.string().datetime().optional(),
  bloodGroup: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalNotes: z.string().optional(),
});

// Incident
export const incidentCreateSchema = z.object({
  manholeId: z.string().uuid(),
  workerId: z.string().uuid().optional(),
  entryLogId: z.string().uuid().optional(),
  incidentType: z.string().min(1),
  description: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});

// Sync
export const syncPushSchema = z.object({
  deviceId: z.string().min(1),
  actions: z.array(z.object({
    action: z.string(),
    payload: z.record(z.unknown()),
    createdAt: z.string().datetime(),
  })),
});
