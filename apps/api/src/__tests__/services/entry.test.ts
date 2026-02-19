import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    entryLog: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    shift: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../../config/env', () => ({
  env: {
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

vi.mock('../../utils/state-machine', () => ({
  EntryStateMachine: vi.fn(),
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

import prisma from '../../config/database';
import { EntryService } from '../../services/entry.service';
import { AppError } from '../../middleware/errorHandler';

describe('EntryService', () => {
  let service: EntryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EntryService();
  });

  describe('startEntry', () => {
    it('should create entry log with correct state', async () => {
      const riskEngine = (service as any).riskEngine;
      riskEngine.canWorkerEnter.mockResolvedValueOnce({
        allowed: true,
        risk: { riskLevel: 'SAFE', riskScore: 15 },
      });

      vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce({
        id: 'shift-1',
        workerId: 'worker-1',
        startTime: new Date(),
        endTime: null,
        status: 'ACTIVE',
        entryCount: 1,
        totalUndergroundMinutes: 30,
        breaksTaken: 0,
        fatigueScore: 20,
        notes: null,
      } as any);

      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([]);

      const createdEntry = {
        id: 'entry-new',
        workerId: 'worker-1',
        manholeId: 'manhole-1',
        taskId: null,
        shiftId: 'shift-1',
        entryTime: new Date(),
        exitTime: null,
        allowedDurationMinutes: 45,
        status: 'ACTIVE',
        state: 'ENTERED',
        geoLatitude: 19.076,
        geoLongitude: 72.877,
        geoVerified: true,
        checklistCompleted: false,
        teamEntryId: null,
        isOfflineEntry: false,
        syncedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        worker: { id: 'worker-1', name: 'Ramesh Kumar' },
        manhole: { id: 'manhole-1', area: 'Dadar West' },
      };
      vi.mocked(prisma.entryLog.create).mockResolvedValueOnce(createdEntry as any);
      vi.mocked(prisma.shift.update).mockResolvedValueOnce({} as any);

      const result = await service.startEntry({
        workerId: 'worker-1',
        manholeId: 'manhole-1',
        latitude: 19.076,
        longitude: 72.877,
        geoVerified: true,
      });

      expect(result.state).toBe('ENTERED');
      expect(result.status).toBe('ACTIVE');
      expect(result.workerId).toBe('worker-1');
      expect(result.manholeId).toBe('manhole-1');

      expect(prisma.entryLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workerId: 'worker-1',
          manholeId: 'manhole-1',
          state: 'ENTERED',
          status: 'ACTIVE',
          geoVerified: true,
          shiftId: 'shift-1',
          allowedDurationMinutes: 45,
        }),
        include: { worker: true, manhole: true },
      });

      // Should increment shift entry count
      expect(prisma.shift.update).toHaveBeenCalledWith({
        where: { id: 'shift-1' },
        data: { entryCount: { increment: 1 } },
      });
    });

    it('should deny entry when risk engine returns not allowed', async () => {
      const riskEngine = (service as any).riskEngine;
      riskEngine.canWorkerEnter.mockResolvedValueOnce({
        allowed: false,
        reason: 'RISK_PROHIBITED',
        risk: { riskLevel: 'PROHIBITED', riskScore: 75 },
      });

      await expect(
        service.startEntry({ workerId: 'worker-1', manholeId: 'manhole-1' })
      ).rejects.toThrow('Entry denied: RISK_PROHIBITED');

      expect(prisma.entryLog.create).not.toHaveBeenCalled();
    });

    it('should set reduced allowed duration for CAUTION risk level', async () => {
      const riskEngine = (service as any).riskEngine;
      riskEngine.canWorkerEnter.mockResolvedValueOnce({
        allowed: true,
        risk: { riskLevel: 'CAUTION', riskScore: 45 },
      });

      vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([]);
      vi.mocked(prisma.entryLog.create).mockResolvedValueOnce({
        id: 'entry-caution',
        allowedDurationMinutes: 30,
        state: 'ENTERED',
        status: 'ACTIVE',
      } as any);

      await service.startEntry({ workerId: 'worker-1', manholeId: 'manhole-1' });

      expect(prisma.entryLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          allowedDurationMinutes: 30,
        }),
        include: { worker: true, manhole: true },
      });
    });
  });

  describe('confirmExit', () => {
    it('should update status to EXITED', async () => {
      const entryTime = new Date(Date.now() - 30 * 60000);
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-1',
        workerId: 'worker-1',
        manholeId: 'manhole-1',
        entryTime,
        exitTime: null,
        status: 'ACTIVE',
        state: 'ACTIVE',
        shiftId: 'shift-1',
      } as any);

      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({
        id: 'entry-1',
        status: 'EXITED',
        state: 'EXITED',
        exitTime: new Date(),
        worker: { name: 'Ramesh Kumar' },
        manhole: { area: 'Dadar West' },
      } as any);
      vi.mocked(prisma.shift.update).mockResolvedValueOnce({} as any);

      const result = await service.confirmExit('entry-1');

      expect(result.status).toBe('EXITED');
      expect(result.state).toBe('EXITED');

      expect(prisma.entryLog.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: expect.objectContaining({
          status: 'EXITED',
          state: 'EXITED',
        }),
        include: { worker: true, manhole: true },
      });

      // Should update shift underground time
      expect(prisma.shift.update).toHaveBeenCalledWith({
        where: { id: 'shift-1' },
        data: { totalUndergroundMinutes: { increment: expect.any(Number) } },
      });
    });

    it('should throw for non-existent entry', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce(null);

      await expect(service.confirmExit('non-existent-id')).rejects.toThrow('Entry log not found');
    });

    it('should throw when entry is not active', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-2',
        status: 'EXITED',
        state: 'EXITED',
      } as any);

      await expect(service.confirmExit('entry-2')).rejects.toThrow('Entry is not active');
    });
  });

  describe('getActiveEntries', () => {
    it('should return only ACTIVE entries', async () => {
      const activeEntries = [
        {
          id: 'entry-a',
          status: 'ACTIVE',
          state: 'ACTIVE',
          entryTime: new Date(),
          worker: { name: 'Ramesh Kumar', phone: '9876543210', employeeId: 'EMP001' },
          manhole: { qrCodeId: 'QR-001', area: 'Dadar West', latitude: 19.076, longitude: 72.877 },
        },
        {
          id: 'entry-b',
          status: 'ACTIVE',
          state: 'ENTERED',
          entryTime: new Date(),
          worker: { name: 'Suresh Patil', phone: '9876543211', employeeId: 'EMP002' },
          manhole: { qrCodeId: 'QR-002', area: 'Andheri East', latitude: 19.119, longitude: 72.846 },
        },
      ];

      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce(activeEntries as any);

      const result = await service.getActiveEntries();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('entry-a');
      expect(result[1].id).toBe('entry-b');

      expect(prisma.entryLog.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        include: {
          worker: { select: { name: true, phone: true, employeeId: true } },
          manhole: { select: { qrCodeId: true, area: true, latitude: true, longitude: true } },
        },
        orderBy: { entryTime: 'asc' },
      });
    });
  });
});
