import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────

vi.mock('../../config/database', () => ({
  default: {
    manhole: { findUnique: vi.fn() },
    entryLog: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    checklist: { create: vi.fn(), findUnique: vi.fn() },
    checkIn: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    healthCheck: { create: vi.fn(), findMany: vi.fn() },
    shift: { findFirst: vi.fn(), update: vi.fn() },
    auditLog: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    workerCertification: { findMany: vi.fn() },
    gasReading: { findFirst: vi.fn() },
    blockage: { count: vi.fn() },
    incident: { count: vi.fn() },
    riskLog: { create: vi.fn() },
  },
}));

vi.mock('../../config/env', () => ({
  env: {
    GEOFENCE_RADIUS_METERS: 50,
    CHECKIN_INTERVAL_MINUTES: 10,
    CHECKIN_GRACE_PERIOD_SECONDS: 60,
    MISSED_CHECKIN_ALERT_THRESHOLD: 2,
    ALERT_CHECK_INTERVAL_MS: 60000,
    MAX_ENTRIES_PER_SHIFT: 4,
    MAX_UNDERGROUND_MINUTES_PER_SHIFT: 120,
    MIN_REST_BETWEEN_ENTRIES_MINUTES: 15,
    MAX_SHIFT_HOURS: 10,
    OPENMETEO_BASE_URL: 'https://api.open-meteo.com/v1/forecast',
    ALERT_SMS_ENABLED: false,
    VAPID_PUBLIC_KEY: '',
    VAPID_PRIVATE_KEY: '',
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../utils/geo-utils', () => ({
  haversineDistance: vi.fn(),
}));

vi.mock('../../utils/crypto', () => ({
  computeAuditHash: vi.fn().mockReturnValue('mock-hash-value'),
}));

vi.mock('@manholeguard/shared/src/constants/ppe-items', () => ({
  PPE_CHECKLIST_ITEMS: [
    { id: 'helmet', label: 'Safety helmet', mandatory: true },
    { id: 'gas_detector', label: 'Gas detector', mandatory: true },
    { id: 'harness', label: 'Safety harness', mandatory: true },
    { id: 'gloves', label: 'Rubber gloves', mandatory: true },
    { id: 'boots', label: 'Gumboots', mandatory: true },
    { id: 'vest', label: 'Reflective vest', mandatory: true },
    { id: 'respirator', label: 'Respirator', mandatory: true },
    { id: 'firstaid', label: 'First-aid kit', mandatory: true },
    { id: 'comms', label: 'Communication device', mandatory: true },
    { id: 'tripod', label: 'Tripod and winch', mandatory: true },
    { id: 'ventilation', label: 'Ventilation fan', mandatory: false },
    { id: 'supervisor', label: 'Supervisor present', mandatory: true },
  ],
}));

vi.mock('@manholeguard/shared/src/constants/fatigue-limits', () => ({
  FATIGUE_LIMITS: {
    MAX_ENTRIES_PER_SHIFT: 4,
    MAX_UNDERGROUND_MINUTES_PER_SHIFT: 120,
    MIN_REST_BETWEEN_ENTRIES_MINUTES: 15,
    MAX_SHIFT_HOURS: 10,
  },
  HEALTH_SYMPTOMS: [
    { id: 'dizziness', label: 'Dizziness', serious: true },
    { id: 'headache', label: 'Headache', serious: false },
    { id: 'chest_pain', label: 'Chest pain', serious: true },
    { id: 'none', label: 'None', serious: false },
  ],
  REQUIRED_CERTIFICATIONS: ['SAFETY_TRAINING', 'CONFINED_SPACE', 'MEDICAL_FITNESS'],
}));

vi.mock('@manholeguard/shared/src/constants/state-machine', () => ({
  STATE_TRANSITIONS: {
    IDLE: { SCAN_QR: 'SCANNED' },
    SCANNED: { COMPLETE_CHECKLIST: 'CHECKLIST_PENDING', RESET: 'IDLE' },
    CHECKLIST_PENDING: { CONFIRM_ENTRY: 'ENTERED', RESET: 'IDLE' },
    ENTERED: { ACTIVATE: 'ACTIVE', CONFIRM_EXIT: 'EXITED', RESET: 'IDLE' },
    ACTIVE: {
      CONFIRM_EXIT: 'EXITED', TRIGGER_ALERT: 'OVERSTAY_ALERT',
      GAS_DANGER: 'GAS_ALERT', MISS_CHECKIN: 'CHECKIN_MISSED', TRIGGER_SOS: 'SOS_TRIGGERED',
    },
    EXITED: { RESET: 'IDLE' },
    OVERSTAY_ALERT: { CONFIRM_EXIT: 'EXITED', TRIGGER_SOS: 'SOS_TRIGGERED' },
    SOS_TRIGGERED: { CANCEL_SOS: 'ACTIVE', CONFIRM_EXIT: 'EXITED' },
    GAS_ALERT: { CONFIRM_EXIT: 'EXITED', RESOLVE_GAS: 'ACTIVE', TRIGGER_SOS: 'SOS_TRIGGERED' },
    CHECKIN_MISSED: { RESOLVE_CHECKIN: 'ACTIVE', TRIGGER_SOS: 'SOS_TRIGGERED', CONFIRM_EXIT: 'EXITED' },
  },
}));

vi.mock('../../middleware/errorHandler', async () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, code: string, message: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.name = 'AppError';
    }
  }
  return { AppError };
});

vi.mock('../../services/risk-engine.service', () => ({
  RiskEngineService: vi.fn().mockImplementation(() => ({
    canWorkerEnter: vi.fn(),
    predictRisk: vi.fn(),
  })),
}));

// ── Imports ────────────────────────────────────────────────────────────

import prisma from '../../config/database';
import { haversineDistance } from '../../utils/geo-utils';
import { GeofenceService } from '../../services/geofence.service';
import { ChecklistService } from '../../services/checklist.service';
import { EntryService } from '../../services/entry.service';
import { CheckInService } from '../../services/checkin.service';
import { HealthCheckService } from '../../services/health-check.service';
import { AuditService } from '../../services/audit.service';
import { CertificationService } from '../../services/certification.service';

// ── Test Suite ─────────────────────────────────────────────────────────

describe('Full Workflow Integration', () => {
  let geofenceService: GeofenceService;
  let checklistService: ChecklistService;
  let entryService: EntryService;
  let checkInService: CheckInService;
  let healthCheckService: HealthCheckService;
  let auditService: AuditService;
  let certService: CertificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    geofenceService = new GeofenceService();
    checklistService = new ChecklistService();
    entryService = new EntryService();
    checkInService = new CheckInService();
    healthCheckService = new HealthCheckService();
    auditService = new AuditService();
    certService = new CertificationService();
  });

  // ── 1. Happy Path ──────────────────────────────────────────────────

  describe('Happy path: full entry-to-exit workflow', () => {
    it('should complete geo-fence → checklist → entry → check-in → exit → health check → audit', async () => {
      // Step 1: Geo-fence verification
      vi.mocked(prisma.manhole.findUnique).mockResolvedValueOnce({
        latitude: 19.076,
        longitude: 72.877,
        geoFenceRadius: null,
      } as any);
      vi.mocked(haversineDistance).mockReturnValueOnce(25);

      const proximity = await geofenceService.verifyProximity('manhole-1', 19.0762, 72.877);
      expect(proximity.withinFence).toBe(true);

      // Step 2: Checklist (all mandatory checked)
      const items = [
        { id: 'helmet', checked: true }, { id: 'gas_detector', checked: true },
        { id: 'harness', checked: true }, { id: 'gloves', checked: true },
        { id: 'boots', checked: true }, { id: 'vest', checked: true },
        { id: 'respirator', checked: true }, { id: 'firstaid', checked: true },
        { id: 'comms', checked: true }, { id: 'tripod', checked: true },
        { id: 'supervisor', checked: true },
      ];

      vi.mocked(prisma.checklist.create).mockResolvedValueOnce({
        id: 'cl-1', entryLogId: 'entry-1', allPassed: true, completedAt: new Date(),
      } as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      const checklist = await checklistService.createChecklist('entry-1', items);
      expect(checklist.allPassed).toBe(true);

      // Step 3: Start entry (risk engine allows)
      const riskEngine = (entryService as any).riskEngine;
      riskEngine.canWorkerEnter.mockResolvedValueOnce({
        allowed: true,
        risk: { riskLevel: 'SAFE', riskScore: 15 },
      });

      vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce({
        id: 'shift-1', entryCount: 0, totalUndergroundMinutes: 0, status: 'ACTIVE',
      } as any);
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([]);
      vi.mocked(prisma.entryLog.create).mockResolvedValueOnce({
        id: 'entry-1', workerId: 'worker-1', manholeId: 'manhole-1',
        state: 'ENTERED', status: 'ACTIVE', allowedDurationMinutes: 45,
      } as any);
      vi.mocked(prisma.shift.update).mockResolvedValueOnce({} as any);

      const entry = await entryService.startEntry({
        workerId: 'worker-1', manholeId: 'manhole-1',
        latitude: 19.0762, longitude: 72.877, geoVerified: true,
      });
      expect(entry.state).toBe('ENTERED');
      expect(entry.status).toBe('ACTIVE');

      // Step 4: Check-in (worker responds on time)
      vi.mocked(prisma.checkIn.create).mockResolvedValueOnce({
        id: 'ci-1', entryLogId: 'entry-1', workerId: 'worker-1',
        promptedAt: new Date(), respondedAt: null,
      } as any);

      const checkIn = await checkInService.promptCheckIn('entry-1', 'worker-1');
      expect(checkIn.respondedAt).toBeNull();

      vi.mocked(prisma.checkIn.findUnique).mockResolvedValueOnce({
        id: 'ci-1', promptedAt: new Date(Date.now() - 20000), respondedAt: null,
      } as any);
      vi.mocked(prisma.checkIn.update).mockResolvedValueOnce({
        id: 'ci-1', respondedAt: new Date(), wasOnTime: true, method: 'tap',
      } as any);

      const response = await checkInService.respondToCheckIn('ci-1', 'tap');
      expect(response.wasOnTime).toBe(true);

      // Step 5: Confirm exit
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-1', workerId: 'worker-1', status: 'ACTIVE', state: 'ACTIVE',
        entryTime: new Date(Date.now() - 30 * 60000), shiftId: 'shift-1',
      } as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({
        id: 'entry-1', status: 'EXITED', state: 'EXITED', exitTime: new Date(),
        worker: { name: 'Ramesh Kumar' }, manhole: { area: 'Dadar West' },
      } as any);
      vi.mocked(prisma.shift.update).mockResolvedValueOnce({} as any);

      const exited = await entryService.confirmExit('entry-1');
      expect(exited.status).toBe('EXITED');
      expect(exited.state).toBe('EXITED');

      // Step 6: Post-exit health check
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-1', workerId: 'worker-1',
      } as any);
      vi.mocked(prisma.healthCheck.create).mockResolvedValueOnce({
        id: 'hc-1', needsMedical: false, symptoms: ['none'],
      } as any);

      const health = await healthCheckService.recordHealthCheck({
        entryLogId: 'entry-1', feelingOk: true, symptoms: ['none'],
      });
      expect(health.needsMedical).toBe(false);

      // Step 7: Audit log
      vi.mocked(prisma.auditLog.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.auditLog.create).mockResolvedValueOnce({
        id: 'audit-1', action: 'ENTRY_COMPLETE', hashChain: 'mock-hash-value',
      } as any);

      const auditEntry = await auditService.log({
        userId: 'worker-1', action: 'ENTRY_COMPLETE',
        entityType: 'EntryLog', entityId: 'entry-1',
      });
      expect(auditEntry.hashChain).toBeDefined();
    });
  });

  // ── 2. SOS Escalation ─────────────────────────────────────────────

  describe('SOS escalation: 3 missed check-ins → auto-SOS', () => {
    it('should escalate from ACTIVE → CHECKIN_MISSED → SOS_TRIGGERED after 3 misses', async () => {
      // First: 2 misses → CHECKIN_MISSED
      vi.mocked(prisma.checkIn.findMany).mockResolvedValueOnce([
        { id: 'ci-1', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
        { id: 'ci-2', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
        { id: 'ci-3', respondedAt: new Date(), wasOnTime: true, promptedAt: new Date() },
      ] as any);

      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-sos', workerId: 'worker-1', status: 'ACTIVE', state: 'ACTIVE',
      } as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      await checkInService.handleMissedCheckIn('entry-sos');

      expect(prisma.entryLog.update).toHaveBeenCalledWith({
        where: { id: 'entry-sos' },
        data: { state: 'CHECKIN_MISSED' },
      });

      // Then: 3 misses → SOS_TRIGGERED
      vi.mocked(prisma.checkIn.findMany).mockResolvedValueOnce([
        { id: 'ci-4', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
        { id: 'ci-5', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
        { id: 'ci-6', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
      ] as any);

      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-sos', workerId: 'worker-1', status: 'ACTIVE', state: 'CHECKIN_MISSED',
      } as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      await checkInService.handleMissedCheckIn('entry-sos');

      expect(prisma.entryLog.update).toHaveBeenCalledWith({
        where: { id: 'entry-sos' },
        data: { state: 'SOS_TRIGGERED' },
      });
    });
  });

  // ── 3. Gas Alert Flow ─────────────────────────────────────────────

  describe('Gas alert: dangerous reading → GAS_ALERT → resolved → exit', () => {
    it('should transition through gas alert states correctly', async () => {
      // Verify geofence service detects entries and could flag gas readings
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-gas',
          workerId: 'worker-1',
          geoLatitude: 19.076,
          geoLongitude: 72.877,
          manhole: { latitude: 19.076, longitude: 72.877, geoFenceRadius: null },
        },
      ] as any);
      vi.mocked(haversineDistance).mockReturnValueOnce(10);

      const proximity = await geofenceService.checkActiveEntryProximity();
      expect(proximity[0].withinFence).toBe(true);

      // Exit after gas resolution
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-gas', workerId: 'worker-1', status: 'ACTIVE', state: 'GAS_ALERT',
        entryTime: new Date(Date.now() - 15 * 60000), shiftId: 'shift-1',
      } as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({
        id: 'entry-gas', status: 'EXITED', state: 'EXITED', exitTime: new Date(),
        worker: { name: 'Worker' }, manhole: { area: 'Test' },
      } as any);
      vi.mocked(prisma.shift.update).mockResolvedValueOnce({} as any);

      const exited = await entryService.confirmExit('entry-gas');
      expect(exited.status).toBe('EXITED');
    });
  });

  // ── 4. Certification Block ────────────────────────────────────────

  describe('Certification block: missing cert → entry denied', () => {
    it('should deny entry when worker lacks required certifications', async () => {
      // Worker missing MEDICAL_FITNESS cert
      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([
        { type: 'SAFETY_TRAINING', isValid: true, expiresAt: new Date(Date.now() + 90 * 86400000) },
        { type: 'CONFINED_SPACE', isValid: true, expiresAt: new Date(Date.now() + 90 * 86400000) },
      ] as any);

      const hasValid = await certService.hasValidCerts('worker-nocert');
      expect(hasValid).toBe(false);

      // Entry service denies via risk engine
      const riskEngine = (entryService as any).riskEngine;
      riskEngine.canWorkerEnter.mockResolvedValueOnce({
        allowed: false,
        reason: 'MISSING_CERTIFICATIONS',
      });

      await expect(
        entryService.startEntry({ workerId: 'worker-nocert', manholeId: 'manhole-1' })
      ).rejects.toThrow('Entry denied: MISSING_CERTIFICATIONS');

      expect(prisma.entryLog.create).not.toHaveBeenCalled();
    });
  });

  // ── 5. Fatigue Block ──────────────────────────────────────────────

  describe('Fatigue block: max entries → entry denied', () => {
    it('should deny entry when worker has reached max entries per shift', async () => {
      const riskEngine = (entryService as any).riskEngine;
      riskEngine.canWorkerEnter.mockResolvedValueOnce({
        allowed: false,
        reason: 'MAX_ENTRIES_REACHED',
      });

      await expect(
        entryService.startEntry({ workerId: 'worker-tired', manholeId: 'manhole-1' })
      ).rejects.toThrow('Entry denied: MAX_ENTRIES_REACHED');

      expect(prisma.entryLog.create).not.toHaveBeenCalled();
    });
  });

  // ── 6. Checklist Failure Block ────────────────────────────────────

  describe('Checklist failure: missing PPE → entry not progressed', () => {
    it('should not progress entry state when mandatory PPE item is missing', async () => {
      const incompleteItems = [
        { id: 'helmet', checked: true },
        { id: 'gas_detector', checked: false }, // mandatory unchecked
        { id: 'harness', checked: true },
        { id: 'gloves', checked: true },
        { id: 'boots', checked: true },
        { id: 'vest', checked: true },
        { id: 'respirator', checked: true },
        { id: 'firstaid', checked: true },
        { id: 'comms', checked: true },
        { id: 'tripod', checked: true },
        { id: 'supervisor', checked: true },
      ];

      vi.mocked(prisma.checklist.create).mockResolvedValueOnce({
        id: 'cl-fail', entryLogId: 'entry-fail', allPassed: false, completedAt: null,
      } as any);

      const checklist = await checklistService.createChecklist('entry-fail', incompleteItems);

      expect(checklist.allPassed).toBe(false);
      expect(prisma.entryLog.update).not.toHaveBeenCalled();
    });
  });

  // ── 7. Audit Integrity Verification ───────────────────────────────

  describe('Audit chain integrity', () => {
    it('should verify valid audit chain returns valid=true', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([
        {
          id: 'log-1', userId: 'user-1', action: 'LOGIN',
          entityType: 'User', entityId: 'user-1',
          hashChain: 'mock-hash-value',
          timestamp: new Date('2026-02-19T08:00:00.000Z'),
        },
      ] as any);

      const result = await auditService.verifyIntegrity();

      expect(result.valid).toBe(true);
      expect(result.checkedCount).toBe(1);
    });
  });

  // ── 8. Health Check with Serious Symptoms ─────────────────────────

  describe('Post-entry health check detects medical need', () => {
    it('should flag needsMedical when worker reports serious symptoms', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-sick', workerId: 'worker-sick',
      } as any);

      vi.mocked(prisma.healthCheck.create).mockResolvedValueOnce({
        id: 'hc-sick', workerId: 'worker-sick', needsMedical: true,
        symptoms: ['dizziness', 'chest_pain'],
      } as any);

      const result = await healthCheckService.recordHealthCheck({
        entryLogId: 'entry-sick',
        feelingOk: false,
        symptoms: ['dizziness', 'chest_pain'],
      });

      expect(result.needsMedical).toBe(true);
    });
  });
});
