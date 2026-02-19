import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    sOSRecord: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    entryLog: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    incident: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../services/nearest-facility.service', () => ({
  NearestFacilityService: vi.fn().mockImplementation(() => ({
    findNearest: vi.fn().mockImplementation((_lat: number, _lng: number, type: string) => {
      if (type === 'hospital') return Promise.resolve({ name: 'Sion Hospital', distanceKm: 1.2 });
      return Promise.resolve({ name: 'Dadar Fire Station', distanceKm: 0.8 });
    }),
  })),
}));

import prisma from '../../config/database';
import { SOSService } from '../../services/sos.service';

describe('SOSService', () => {
  let service: SOSService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SOSService();
  });

  describe('triggerSOS', () => {
    it('should create SOS record with nearest facilities', async () => {
      vi.mocked(prisma.entryLog.findUnique)
        .mockResolvedValueOnce({
          id: 'entry-1',
          workerId: 'worker-1',
          manholeId: 'manhole-1',
          manhole: { latitude: 19.076, longitude: 72.877 },
        } as any)
        .mockResolvedValueOnce({
          id: 'entry-1',
          workerId: 'worker-1',
          manholeId: 'manhole-1',
        } as any);

      const mockSOS = {
        id: 'sos-1',
        workerId: 'worker-1',
        entryLogId: 'entry-1',
        latitude: 19.076,
        longitude: 72.877,
        triggerMethod: 'manual_button',
        nearestHospital: 'Sion Hospital',
        hospitalDistance: 1.2,
        nearestFireStation: 'Dadar Fire Station',
        respondedAt: null,
        resolvedAt: null,
        outcome: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.sOSRecord.create).mockResolvedValueOnce(mockSOS as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.incident.create).mockResolvedValueOnce({} as any);

      const result = await service.triggerSOS({
        workerId: 'worker-1',
        entryLogId: 'entry-1',
        method: 'manual_button',
      });

      expect(result.id).toBe('sos-1');
      expect(result.triggerMethod).toBe('manual_button');
      expect(result.nearestHospital).toBe('Sion Hospital');
      expect(result.nearestFireStation).toBe('Dadar Fire Station');

      expect(prisma.sOSRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workerId: 'worker-1',
          entryLogId: 'entry-1',
          triggerMethod: 'manual_button',
          nearestHospital: 'Sion Hospital',
          hospitalDistance: 1.2,
          nearestFireStation: 'Dadar Fire Station',
        }),
      });
    });

    it('should update entry state to SOS_TRIGGERED', async () => {
      vi.mocked(prisma.entryLog.findUnique)
        .mockResolvedValueOnce({
          id: 'entry-2',
          manholeId: 'manhole-2',
          manhole: { latitude: 19.1, longitude: 72.9 },
        } as any)
        .mockResolvedValueOnce({
          id: 'entry-2',
          manholeId: 'manhole-2',
        } as any);

      vi.mocked(prisma.sOSRecord.create).mockResolvedValueOnce({ id: 'sos-2' } as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.incident.create).mockResolvedValueOnce({} as any);

      await service.triggerSOS({
        workerId: 'worker-2',
        entryLogId: 'entry-2',
        method: 'auto_missed_checkin',
      });

      expect(prisma.entryLog.update).toHaveBeenCalledWith({
        where: { id: 'entry-2' },
        data: { state: 'SOS_TRIGGERED' },
      });
    });

    it('should create critical incident', async () => {
      vi.mocked(prisma.entryLog.findUnique)
        .mockResolvedValueOnce({
          id: 'entry-3',
          manholeId: 'manhole-3',
          manhole: { latitude: 19.05, longitude: 72.85 },
        } as any)
        .mockResolvedValueOnce({
          id: 'entry-3',
          manholeId: 'manhole-3',
          workerId: 'worker-3',
        } as any);

      vi.mocked(prisma.sOSRecord.create).mockResolvedValueOnce({ id: 'sos-3' } as any);
      vi.mocked(prisma.entryLog.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.incident.create).mockResolvedValueOnce({} as any);

      await service.triggerSOS({
        workerId: 'worker-3',
        entryLogId: 'entry-3',
        method: 'voice_command',
      });

      expect(prisma.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          manholeId: 'manhole-3',
          workerId: 'worker-3',
          entryLogId: 'entry-3',
          incidentType: 'SOS_EMERGENCY',
          severity: 'CRITICAL',
          description: 'SOS triggered via voice_command',
        }),
      });
    });

    it('should handle SOS without entryLogId (standalone trigger)', async () => {
      vi.mocked(prisma.sOSRecord.create).mockResolvedValueOnce({
        id: 'sos-4',
        workerId: 'worker-4',
        entryLogId: null,
        latitude: 19.076,
        longitude: 72.877,
        triggerMethod: 'panic_button',
        nearestHospital: 'Sion Hospital',
        hospitalDistance: 1.2,
        nearestFireStation: 'Dadar Fire Station',
      } as any);

      const result = await service.triggerSOS({
        workerId: 'worker-4',
        latitude: 19.076,
        longitude: 72.877,
        method: 'panic_button',
      });

      expect(result.id).toBe('sos-4');
      // Should not attempt to update entry state or create incident
      expect(prisma.entryLog.update).not.toHaveBeenCalled();
      expect(prisma.incident.create).not.toHaveBeenCalled();
    });
  });

  describe('resolveSOS', () => {
    it('should set resolvedAt and outcome', async () => {
      const resolvedRecord = {
        id: 'sos-5',
        workerId: 'worker-5',
        resolvedAt: new Date(),
        outcome: 'Worker safely evacuated. No injuries.',
      };

      vi.mocked(prisma.sOSRecord.update).mockResolvedValueOnce(resolvedRecord as any);

      const result = await service.resolveSOS('sos-5', 'Worker safely evacuated. No injuries.');

      expect(result.resolvedAt).not.toBeNull();
      expect(result.outcome).toBe('Worker safely evacuated. No injuries.');

      expect(prisma.sOSRecord.update).toHaveBeenCalledWith({
        where: { id: 'sos-5' },
        data: {
          resolvedAt: expect.any(Date),
          outcome: 'Worker safely evacuated. No injuries.',
        },
      });
    });
  });
});
