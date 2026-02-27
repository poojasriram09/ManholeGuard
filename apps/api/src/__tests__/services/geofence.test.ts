import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    manhole: {
      findUnique: vi.fn(),
    },
    entryLog: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../config/env', () => ({
  env: {
    GEOFENCE_RADIUS_METERS: 50,
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../utils/geo-utils', () => ({
  haversineDistance: vi.fn(),
}));

import prisma from '../../config/database';
import { GeofenceService } from '../../services/geofence.service';
import { haversineDistance } from '../../utils/geo-utils';
import { logger } from '../../utils/logger';

describe('GeofenceService', () => {
  let service: GeofenceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GeofenceService();
  });

  describe('verifyProximity', () => {
    it('should return withinFence=true when distance is within default radius', async () => {
      vi.mocked(prisma.manhole.findUnique).mockResolvedValueOnce({
        latitude: 19.076,
        longitude: 72.877,
        geoFenceRadius: null,
      } as any);
      vi.mocked(haversineDistance).mockReturnValueOnce(30);

      const result = await service.verifyProximity('manhole-1', 19.0762, 72.877);

      expect(result.withinFence).toBe(true);
      expect(result.distance).toBe(30);
      expect(result.maxRadius).toBe(50);
    });

    it('should return withinFence=false when distance exceeds radius', async () => {
      vi.mocked(prisma.manhole.findUnique).mockResolvedValueOnce({
        latitude: 19.076,
        longitude: 72.877,
        geoFenceRadius: null,
      } as any);
      vi.mocked(haversineDistance).mockReturnValueOnce(80);

      const result = await service.verifyProximity('manhole-1', 19.078, 72.880);

      expect(result.withinFence).toBe(false);
      expect(result.distance).toBe(80);
      expect(result.maxRadius).toBe(50);
    });

    it('should use manhole custom geoFenceRadius when set', async () => {
      vi.mocked(prisma.manhole.findUnique).mockResolvedValueOnce({
        latitude: 19.076,
        longitude: 72.877,
        geoFenceRadius: 100,
      } as any);
      vi.mocked(haversineDistance).mockReturnValueOnce(80);

      const result = await service.verifyProximity('manhole-1', 19.078, 72.880);

      expect(result.withinFence).toBe(true);
      expect(result.maxRadius).toBe(100);
    });

    it('should fall back to env GEOFENCE_RADIUS_METERS when manhole has no custom radius', async () => {
      vi.mocked(prisma.manhole.findUnique).mockResolvedValueOnce({
        latitude: 19.076,
        longitude: 72.877,
        geoFenceRadius: null,
      } as any);
      vi.mocked(haversineDistance).mockReturnValueOnce(45);

      const result = await service.verifyProximity('manhole-1', 19.0762, 72.877);

      expect(result.maxRadius).toBe(50); // env default
      expect(result.withinFence).toBe(true);
    });

    it('should throw error when manhole not found', async () => {
      vi.mocked(prisma.manhole.findUnique).mockResolvedValueOnce(null);

      await expect(
        service.verifyProximity('non-existent', 19.076, 72.877)
      ).rejects.toThrow('Manhole non-existent not found');
    });

    it('should round distance to 2 decimal places', async () => {
      vi.mocked(prisma.manhole.findUnique).mockResolvedValueOnce({
        latitude: 19.076,
        longitude: 72.877,
        geoFenceRadius: null,
      } as any);
      vi.mocked(haversineDistance).mockReturnValueOnce(30.456789);

      const result = await service.verifyProximity('manhole-1', 19.0762, 72.877);

      expect(result.distance).toBe(30.46);
    });

    it('should return withinFence=true when distance equals maxRadius exactly', async () => {
      vi.mocked(prisma.manhole.findUnique).mockResolvedValueOnce({
        latitude: 19.076,
        longitude: 72.877,
        geoFenceRadius: null,
      } as any);
      vi.mocked(haversineDistance).mockReturnValueOnce(50);

      const result = await service.verifyProximity('manhole-1', 19.0762, 72.877);

      expect(result.withinFence).toBe(true);
    });
  });

  describe('checkActiveEntryProximity', () => {
    it('should return proximity results for active entries', async () => {
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-1',
          workerId: 'worker-1',
          geoLatitude: 19.0762,
          geoLongitude: 72.877,
          manhole: { latitude: 19.076, longitude: 72.877, geoFenceRadius: null },
        },
        {
          id: 'entry-2',
          workerId: 'worker-2',
          geoLatitude: 19.080,
          geoLongitude: 72.880,
          manhole: { latitude: 19.076, longitude: 72.877, geoFenceRadius: null },
        },
      ] as any);

      vi.mocked(haversineDistance)
        .mockReturnValueOnce(30) // within fence
        .mockReturnValueOnce(80); // outside fence

      const results = await service.checkActiveEntryProximity();

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        entryId: 'entry-1',
        workerId: 'worker-1',
        distance: 30,
        withinFence: true,
      });
      expect(results[1]).toEqual({
        entryId: 'entry-2',
        workerId: 'worker-2',
        distance: 80,
        withinFence: false,
      });
    });

    it('should skip entries without coordinates', async () => {
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-1',
          workerId: 'worker-1',
          geoLatitude: null,
          geoLongitude: null,
          manhole: { latitude: 19.076, longitude: 72.877, geoFenceRadius: null },
        },
      ] as any);

      const results = await service.checkActiveEntryProximity();

      expect(results).toHaveLength(0);
      expect(haversineDistance).not.toHaveBeenCalled();
    });

    it('should log warnings for entries outside geofence', async () => {
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([
        {
          id: 'entry-drift',
          workerId: 'worker-1',
          geoLatitude: 19.090,
          geoLongitude: 72.890,
          manhole: { latitude: 19.076, longitude: 72.877, geoFenceRadius: null },
        },
      ] as any);

      vi.mocked(haversineDistance).mockReturnValueOnce(200);

      await service.checkActiveEntryProximity();

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('entry-drift')
      );
    });

    it('should return empty array when no active entries exist', async () => {
      vi.mocked(prisma.entryLog.findMany).mockResolvedValueOnce([]);

      const results = await service.checkActiveEntryProximity();

      expect(results).toHaveLength(0);
    });
  });
});
