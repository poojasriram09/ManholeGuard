import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    shift: { findFirst: vi.fn() },
    entryLog: { findFirst: vi.fn() },
  },
}));

vi.mock('../../config/env', () => ({
  env: {
    MAX_ENTRIES_PER_SHIFT: 4,
    MAX_UNDERGROUND_MINUTES_PER_SHIFT: 120,
    MIN_REST_BETWEEN_ENTRIES_MINUTES: 15,
    MAX_SHIFT_HOURS: 10,
  },
}));

import prisma from '../../config/database';
import { FatigueService } from '../../services/fatigue.service';

describe('FatigueService', () => {
  let service: FatigueService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FatigueService();
  });

  describe('canWorkerEnter', () => {
    it('should allow entry when no active shift exists', async () => {
      vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce(null);

      const result = await service.canWorkerEnter('worker-1');

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should deny when max entries reached (4)', async () => {
      vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce({
        id: 'shift-1',
        workerId: 'worker-1',
        startTime: new Date(Date.now() - 5 * 3600000), // 5 hours ago
        endTime: null,
        status: 'ACTIVE',
        entryCount: 4,
        totalUndergroundMinutes: 90,
        breaksTaken: 2,
        fatigueScore: 60,
        notes: null,
      } as any);

      const result = await service.canWorkerEnter('worker-1');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('MAX_ENTRIES_REACHED');
    });

    it('should deny when max underground time reached (120 min)', async () => {
      vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce({
        id: 'shift-2',
        workerId: 'worker-2',
        startTime: new Date(Date.now() - 6 * 3600000),
        endTime: null,
        status: 'ACTIVE',
        entryCount: 3,
        totalUndergroundMinutes: 120,
        breaksTaken: 2,
        fatigueScore: 70,
        notes: null,
      } as any);

      const result = await service.canWorkerEnter('worker-2');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('MAX_UNDERGROUND_TIME_REACHED');
    });

    it('should deny when rest period insufficient (less than 15 min)', async () => {
      vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce({
        id: 'shift-3',
        workerId: 'worker-3',
        startTime: new Date(Date.now() - 3 * 3600000),
        endTime: null,
        status: 'ACTIVE',
        entryCount: 2,
        totalUndergroundMinutes: 60,
        breaksTaken: 1,
        fatigueScore: 40,
        notes: null,
      } as any);

      // Last exit was 5 minutes ago -- less than 15 min rest required
      vi.mocked(prisma.entryLog.findFirst).mockResolvedValueOnce({
        id: 'entry-last',
        workerId: 'worker-3',
        exitTime: new Date(Date.now() - 5 * 60000),
        status: 'EXITED',
      } as any);

      const result = await service.canWorkerEnter('worker-3');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('REST_REQUIRED');
    });

    it('should deny when shift duration exceeds max hours (10)', async () => {
      vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce({
        id: 'shift-4',
        workerId: 'worker-4',
        startTime: new Date(Date.now() - 11 * 3600000), // 11 hours ago
        endTime: null,
        status: 'ACTIVE',
        entryCount: 3,
        totalUndergroundMinutes: 90,
        breaksTaken: 2,
        fatigueScore: 60,
        notes: null,
      } as any);

      // Rest is sufficient
      vi.mocked(prisma.entryLog.findFirst).mockResolvedValueOnce({
        id: 'entry-prev',
        workerId: 'worker-4',
        exitTime: new Date(Date.now() - 30 * 60000), // 30 min ago
        status: 'EXITED',
      } as any);

      const result = await service.canWorkerEnter('worker-4');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('SHIFT_EXCEEDED');
    });

    it('should allow entry when all conditions met', async () => {
      vi.mocked(prisma.shift.findFirst).mockResolvedValueOnce({
        id: 'shift-5',
        workerId: 'worker-5',
        startTime: new Date(Date.now() - 4 * 3600000), // 4 hours ago
        endTime: null,
        status: 'ACTIVE',
        entryCount: 2,
        totalUndergroundMinutes: 60,
        breaksTaken: 1,
        fatigueScore: 30,
        notes: null,
      } as any);

      // Last exit 20 minutes ago -- above 15 min rest requirement
      vi.mocked(prisma.entryLog.findFirst).mockResolvedValueOnce({
        id: 'entry-ok',
        workerId: 'worker-5',
        exitTime: new Date(Date.now() - 20 * 60000),
        status: 'EXITED',
      } as any);

      const result = await service.canWorkerEnter('worker-5');

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('calculateFatigueScore', () => {
    it('should return 0-100 based on shift data', () => {
      const shiftData = {
        entryCount: 2,
        totalUndergroundMinutes: 60,
        startTime: new Date(Date.now() - 5 * 3600000), // 5 hours into shift
      };

      const score = service.calculateFatigueScore(shiftData);

      // entryFactor = (2/4) * 30 = 15
      // timeFactor = (60/120) * 40 = 20
      // hoursFactor = (5/10) * 30 = 15
      // total = 50
      expect(score).toBe(50);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should cap at 100 when all limits reached', () => {
      const shiftData = {
        entryCount: 4,
        totalUndergroundMinutes: 120,
        startTime: new Date(Date.now() - 10 * 3600000), // 10 hours
      };

      const score = service.calculateFatigueScore(shiftData);

      // entryFactor = (4/4) * 30 = 30
      // timeFactor = (120/120) * 40 = 40
      // hoursFactor = (10/10) * 30 = 30
      // total = 100
      expect(score).toBe(100);
    });

    it('should return 0 for fresh shift with no entries', () => {
      const shiftData = {
        entryCount: 0,
        totalUndergroundMinutes: 0,
        startTime: new Date(), // Just started
      };

      const score = service.calculateFatigueScore(shiftData);

      expect(score).toBe(0);
    });
  });
});
