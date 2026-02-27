import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    entryLog: {
      findUnique: vi.fn(),
    },
    healthCheck: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@manholeguard/shared/src/constants/fatigue-limits', () => ({
  HEALTH_SYMPTOMS: [
    { id: 'dizziness', label: 'Dizziness / lightheadedness', serious: true },
    { id: 'nausea', label: 'Nausea / vomiting', serious: true },
    { id: 'breathlessness', label: 'Difficulty breathing', serious: true },
    { id: 'skin_irritation', label: 'Skin irritation / rash', serious: false },
    { id: 'eye_irritation', label: 'Eye irritation / burning', serious: false },
    { id: 'headache', label: 'Headache', serious: false },
    { id: 'chest_pain', label: 'Chest pain / tightness', serious: true },
    { id: 'unconscious', label: 'Loss of consciousness', serious: true },
    { id: 'none', label: 'None - I feel fine', serious: false },
  ],
  FATIGUE_LIMITS: {
    MAX_ENTRIES_PER_SHIFT: 4,
    MAX_UNDERGROUND_MINUTES_PER_SHIFT: 120,
    MIN_REST_BETWEEN_ENTRIES_MINUTES: 15,
    MAX_SHIFT_HOURS: 10,
  },
  REQUIRED_CERTIFICATIONS: ['SAFETY_TRAINING', 'CONFINED_SPACE', 'MEDICAL_FITNESS'],
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import prisma from '../../config/database';
import { HealthCheckService } from '../../services/health-check.service';
import { logger } from '../../utils/logger';

describe('HealthCheckService', () => {
  let service: HealthCheckService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HealthCheckService();
  });

  describe('recordHealthCheck', () => {
    it('should set needsMedical=true for serious symptom (dizziness)', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-1',
        workerId: 'worker-1',
      } as any);

      vi.mocked(prisma.healthCheck.create).mockResolvedValueOnce({
        id: 'hc-1',
        entryLogId: 'entry-1',
        workerId: 'worker-1',
        feelingOk: false,
        symptoms: ['dizziness'],
        needsMedical: true,
      } as any);

      const result = await service.recordHealthCheck({
        entryLogId: 'entry-1',
        workerId: 'worker-1',
        feelingOk: false,
        symptoms: ['dizziness'],
      });

      expect(result.needsMedical).toBe(true);
      expect(prisma.healthCheck.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          needsMedical: true,
        }),
      });
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Medical attention needed')
      );
    });

    it('should set needsMedical=true for chest_pain', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-2',
        workerId: 'worker-2',
      } as any);

      vi.mocked(prisma.healthCheck.create).mockResolvedValueOnce({
        id: 'hc-2',
        entryLogId: 'entry-2',
        workerId: 'worker-2',
        needsMedical: true,
        symptoms: ['chest_pain'],
      } as any);

      const result = await service.recordHealthCheck({
        entryLogId: 'entry-2',
        feelingOk: false,
        symptoms: ['chest_pain'],
      });

      expect(result.needsMedical).toBe(true);
    });

    it('should set needsMedical=false for non-serious symptoms only', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-3',
        workerId: 'worker-3',
      } as any);

      vi.mocked(prisma.healthCheck.create).mockResolvedValueOnce({
        id: 'hc-3',
        entryLogId: 'entry-3',
        workerId: 'worker-3',
        needsMedical: false,
        symptoms: ['headache', 'skin_irritation'],
      } as any);

      const result = await service.recordHealthCheck({
        entryLogId: 'entry-3',
        feelingOk: false,
        symptoms: ['headache', 'skin_irritation'],
      });

      expect(result.needsMedical).toBe(false);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should set needsMedical=false when symptom is "none"', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-4',
        workerId: 'worker-4',
      } as any);

      vi.mocked(prisma.healthCheck.create).mockResolvedValueOnce({
        id: 'hc-4',
        needsMedical: false,
        symptoms: ['none'],
      } as any);

      const result = await service.recordHealthCheck({
        entryLogId: 'entry-4',
        feelingOk: true,
        symptoms: ['none'],
      });

      expect(result.needsMedical).toBe(false);
    });

    it('should use workerId fallback from entry when not provided', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-5',
        workerId: 'worker-fallback',
      } as any);

      vi.mocked(prisma.healthCheck.create).mockResolvedValueOnce({
        id: 'hc-5',
        workerId: 'worker-fallback',
        needsMedical: false,
      } as any);

      await service.recordHealthCheck({
        entryLogId: 'entry-5',
        feelingOk: true,
        symptoms: [],
      });

      expect(prisma.healthCheck.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workerId: 'worker-fallback',
        }),
      });
    });

    it('should throw when entry not found', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce(null);

      await expect(
        service.recordHealthCheck({
          entryLogId: 'non-existent',
          feelingOk: true,
          symptoms: [],
        })
      ).rejects.toThrow('Entry not found');
    });

    it('should handle multiple serious symptoms', async () => {
      vi.mocked(prisma.entryLog.findUnique).mockResolvedValueOnce({
        id: 'entry-6',
        workerId: 'worker-6',
      } as any);

      vi.mocked(prisma.healthCheck.create).mockResolvedValueOnce({
        id: 'hc-6',
        needsMedical: true,
        symptoms: ['dizziness', 'chest_pain', 'headache'],
      } as any);

      const result = await service.recordHealthCheck({
        entryLogId: 'entry-6',
        feelingOk: false,
        symptoms: ['dizziness', 'chest_pain', 'headache'],
      });

      expect(result.needsMedical).toBe(true);
    });
  });

  describe('getWorkerHealthTrend', () => {
    it('should flag needsAttention when symptomaticCount > 3', async () => {
      vi.mocked(prisma.healthCheck.findMany).mockResolvedValueOnce([
        { feelingOk: false, symptoms: ['headache'] },
        { feelingOk: false, symptoms: ['dizziness'] },
        { feelingOk: true, symptoms: ['skin_irritation'] },
        { feelingOk: false, symptoms: ['nausea'] },
      ] as any);

      const trend = await service.getWorkerHealthTrend('worker-1');

      expect(trend.totalChecks).toBe(4);
      expect(trend.symptomaticCount).toBe(4); // all have symptoms or !feelingOk
      expect(trend.needsAttention).toBe(true);
    });

    it('should build symptom frequency map', async () => {
      vi.mocked(prisma.healthCheck.findMany).mockResolvedValueOnce([
        { feelingOk: false, symptoms: ['headache', 'dizziness'] },
        { feelingOk: false, symptoms: ['headache'] },
        { feelingOk: true, symptoms: [] },
      ] as any);

      const trend = await service.getWorkerHealthTrend('worker-2');

      expect(trend.symptomFrequency).toEqual({
        headache: 2,
        dizziness: 1,
      });
    });

    it('should return needsAttention=false when symptomaticCount <= 3', async () => {
      vi.mocked(prisma.healthCheck.findMany).mockResolvedValueOnce([
        { feelingOk: true, symptoms: [] },
        { feelingOk: true, symptoms: [] },
        { feelingOk: false, symptoms: ['headache'] },
      ] as any);

      const trend = await service.getWorkerHealthTrend('worker-3');

      expect(trend.symptomaticCount).toBe(1);
      expect(trend.needsAttention).toBe(false);
    });

    it('should handle empty health history', async () => {
      vi.mocked(prisma.healthCheck.findMany).mockResolvedValueOnce([]);

      const trend = await service.getWorkerHealthTrend('worker-4');

      expect(trend.totalChecks).toBe(0);
      expect(trend.symptomaticCount).toBe(0);
      expect(trend.symptomFrequency).toEqual({});
      expect(trend.needsAttention).toBe(false);
    });

    it('should count feelingOk=false even with no symptoms as symptomatic', async () => {
      vi.mocked(prisma.healthCheck.findMany).mockResolvedValueOnce([
        { feelingOk: false, symptoms: [] },
      ] as any);

      const trend = await service.getWorkerHealthTrend('worker-5');

      expect(trend.symptomaticCount).toBe(1);
    });
  });
});
