import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    checkIn: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    entryLog: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../../config/env', () => ({
  env: {
    CHECKIN_INTERVAL_MINUTES: 10,
    CHECKIN_GRACE_PERIOD_SECONDS: 60,
    MISSED_CHECKIN_ALERT_THRESHOLD: 2,
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import prisma from '../../config/database';
import { CheckInService } from '../../services/checkin.service';

describe('CheckInService', () => {
  let service: CheckInService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CheckInService();
  });

  describe('promptCheckIn', () => {
    it('should create check-in record with correct entryLogId and workerId', async () => {
      const mockCheckIn = {
        id: 'ci-1',
        entryLogId: 'entry-1',
        workerId: 'worker-1',
        promptedAt: new Date(),
        respondedAt: null,
        wasOnTime: false,
        method: 'tap',
      };

      vi.mocked(prisma.checkIn.create).mockResolvedValueOnce(mockCheckIn as any);

      const result = await service.promptCheckIn('entry-1', 'worker-1');

      expect(result.id).toBe('ci-1');
      expect(result.entryLogId).toBe('entry-1');
      expect(result.workerId).toBe('worker-1');
      expect(result.respondedAt).toBeNull();

      expect(prisma.checkIn.create).toHaveBeenCalledWith({
        data: {
          entryLogId: 'entry-1',
          workerId: 'worker-1',
          promptedAt: expect.any(Date),
        },
      });
    });
  });

  describe('respondToCheckIn', () => {
    it('should mark as responded with method and wasOnTime=true within grace period', async () => {
      const promptedAt = new Date(Date.now() - 30000); // 30 seconds ago (within 60s grace)

      vi.mocked(prisma.checkIn.findUnique).mockResolvedValueOnce({
        id: 'ci-2',
        entryLogId: 'entry-2',
        workerId: 'worker-2',
        promptedAt,
        respondedAt: null,
        wasOnTime: false,
        method: 'tap',
      } as any);

      vi.mocked(prisma.checkIn.update).mockResolvedValueOnce({
        id: 'ci-2',
        entryLogId: 'entry-2',
        workerId: 'worker-2',
        promptedAt,
        respondedAt: new Date(),
        wasOnTime: true,
        method: 'voice',
      } as any);

      const result = await service.respondToCheckIn('ci-2', 'voice');

      expect(result.respondedAt).not.toBeNull();
      expect(result.wasOnTime).toBe(true);
      expect(result.method).toBe('voice');

      expect(prisma.checkIn.update).toHaveBeenCalledWith({
        where: { id: 'ci-2' },
        data: {
          respondedAt: expect.any(Date),
          wasOnTime: true,
          method: 'voice',
        },
      });
    });

    it('should mark wasOnTime=false when response is late', async () => {
      const promptedAt = new Date(Date.now() - 120000); // 120 seconds ago (beyond 60s grace)

      vi.mocked(prisma.checkIn.findUnique).mockResolvedValueOnce({
        id: 'ci-3',
        entryLogId: 'entry-3',
        workerId: 'worker-3',
        promptedAt,
        respondedAt: null,
        wasOnTime: false,
        method: 'tap',
      } as any);

      vi.mocked(prisma.checkIn.update).mockResolvedValueOnce({
        id: 'ci-3',
        respondedAt: new Date(),
        wasOnTime: false,
        method: 'tap',
      } as any);

      const result = await service.respondToCheckIn('ci-3', 'tap');

      expect(result.wasOnTime).toBe(false);

      expect(prisma.checkIn.update).toHaveBeenCalledWith({
        where: { id: 'ci-3' },
        data: expect.objectContaining({
          wasOnTime: false,
        }),
      });
    });

    it('should throw error for non-existent check-in', async () => {
      vi.mocked(prisma.checkIn.findUnique).mockResolvedValueOnce(null);

      await expect(service.respondToCheckIn('non-existent')).rejects.toThrow('Check-in not found');
    });
  });

  describe('getConsecutiveMissedCount', () => {
    it('should count consecutive unresponded check-ins from most recent', async () => {
      vi.mocked(prisma.checkIn.findMany).mockResolvedValueOnce([
        // Most recent first (desc order)
        { id: 'ci-a', respondedAt: null, wasOnTime: false, promptedAt: new Date(Date.now() - 5000) },
        { id: 'ci-b', respondedAt: null, wasOnTime: false, promptedAt: new Date(Date.now() - 10 * 60000) },
        { id: 'ci-c', respondedAt: null, wasOnTime: false, promptedAt: new Date(Date.now() - 20 * 60000) },
        { id: 'ci-d', respondedAt: new Date(), wasOnTime: true, promptedAt: new Date(Date.now() - 30 * 60000) },
      ] as any);

      const count = await service.getConsecutiveMissedCount('entry-4');

      expect(count).toBe(3);

      expect(prisma.checkIn.findMany).toHaveBeenCalledWith({
        where: { entryLogId: 'entry-4' },
        orderBy: { promptedAt: 'desc' },
      });
    });

    it('should return 0 when most recent check-in is responded', async () => {
      vi.mocked(prisma.checkIn.findMany).mockResolvedValueOnce([
        { id: 'ci-x', respondedAt: new Date(), wasOnTime: true, promptedAt: new Date() },
        { id: 'ci-y', respondedAt: null, wasOnTime: false, promptedAt: new Date(Date.now() - 600000) },
      ] as any);

      const count = await service.getConsecutiveMissedCount('entry-5');

      expect(count).toBe(0);
    });
  });

  describe('handleMissedCheckIn', () => {
    it('should trigger SOS (set SOS_TRIGGERED state) after 3 misses', async () => {
      // Mock getConsecutiveMissedCount internally -- the method calls itself
      vi.mocked(prisma.checkIn.findMany).mockResolvedValueOnce([
        { id: 'ci-1', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
        { id: 'ci-2', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
        { id: 'ci-3', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
      ] as any);

      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-sos',
        workerId: 'worker-sos',
        status: 'ACTIVE',
        state: 'ACTIVE',
      } as any);

      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      await service.handleMissedCheckIn('entry-sos');

      expect(prisma.entryLog.update).toHaveBeenCalledWith({
        where: { id: 'entry-sos' },
        data: { state: 'SOS_TRIGGERED' },
      });
    });

    it('should set CHECKIN_MISSED state for 2 misses (at threshold)', async () => {
      vi.mocked(prisma.checkIn.findMany).mockResolvedValueOnce([
        { id: 'ci-m1', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
        { id: 'ci-m2', respondedAt: null, wasOnTime: false, promptedAt: new Date() },
        { id: 'ci-m3', respondedAt: new Date(), wasOnTime: true, promptedAt: new Date() },
      ] as any);

      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-miss',
        workerId: 'worker-miss',
        status: 'ACTIVE',
        state: 'ACTIVE',
      } as any);

      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);

      await service.handleMissedCheckIn('entry-miss');

      expect(prisma.entryLog.update).toHaveBeenCalledWith({
        where: { id: 'entry-miss' },
        data: { state: 'CHECKIN_MISSED' },
      });
    });
  });
});
