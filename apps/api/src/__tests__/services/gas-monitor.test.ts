import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    gasReading: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('@manholeguard/shared/src/constants/gas-thresholds', () => ({
  GAS_THRESHOLDS: {
    h2s: { warning: 10, danger: 20, unit: 'ppm', name: 'Hydrogen Sulfide' },
    ch4: { warning: 1000, danger: 5000, unit: 'ppm', name: 'Methane' },
    co: { warning: 35, danger: 100, unit: 'ppm', name: 'Carbon Monoxide' },
    co2: { warning: 5000, danger: 40000, unit: 'ppm', name: 'Carbon Dioxide' },
    nh3: { warning: 25, danger: 50, unit: 'ppm', name: 'Ammonia' },
  },
  OXYGEN_THRESHOLD: {
    low: 19.5,
    high: 23.5,
    unit: '%',
    name: 'Oxygen',
  },
}));

import prisma from '../../config/database';
import { GasMonitorService } from '../../services/gas-monitor.service';

describe('GasMonitorService', () => {
  let service: GasMonitorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GasMonitorService();
  });

  describe('evaluateDanger', () => {
    it('should return true when H2S >= 20 (danger level)', () => {
      const reading = { h2s: 25, ch4: 0, co: 0, o2: 20.9, co2: 0, nh3: 0 };
      expect(service.evaluateDanger(reading)).toBe(true);
    });

    it('should return true when O2 < 19.5 (low oxygen)', () => {
      const reading = { h2s: 0, ch4: 0, co: 0, o2: 18.0, co2: 0, nh3: 0 };
      expect(service.evaluateDanger(reading)).toBe(true);
    });

    it('should return true when O2 > 23.5 (high oxygen)', () => {
      const reading = { h2s: 0, ch4: 0, co: 0, o2: 24.0, co2: 0, nh3: 0 };
      expect(service.evaluateDanger(reading)).toBe(true);
    });

    it('should return true when CH4 >= 5000 (danger level)', () => {
      const reading = { h2s: 0, ch4: 5000, co: 0, o2: 20.9, co2: 0, nh3: 0 };
      expect(service.evaluateDanger(reading)).toBe(true);
    });

    it('should return true when CO >= 100 (danger level)', () => {
      const reading = { h2s: 0, ch4: 0, co: 100, o2: 20.9, co2: 0, nh3: 0 };
      expect(service.evaluateDanger(reading)).toBe(true);
    });

    it('should return false when all gases within safe range', () => {
      const reading = { h2s: 5, ch4: 500, co: 20, o2: 20.9, co2: 1000, nh3: 10 };
      expect(service.evaluateDanger(reading)).toBe(false);
    });
  });

  describe('calculateGasFactor', () => {
    it('should return 100 for danger level readings', () => {
      const reading = { h2s: 25, ch4: 0, co: 0, o2: 20.9, co2: 0, nh3: 0 };
      expect(service.calculateGasFactor(reading)).toBe(100);
    });

    it('should return 100 for low oxygen', () => {
      const reading = { h2s: 0, ch4: 0, co: 0, o2: 18.5, co2: 0, nh3: 0 };
      expect(service.calculateGasFactor(reading)).toBe(100);
    });

    it('should return 60 for warning-level readings', () => {
      // H2S at warning level (10), below danger (20)
      const reading = { h2s: 10, ch4: 0, co: 0, o2: 20.9, co2: 0, nh3: 0 };
      expect(service.calculateGasFactor(reading)).toBe(60);
    });

    it('should return proportional factor for below-warning levels', () => {
      // H2S at 5 ppm (warning threshold is 10)
      // normalized = (5/10) * 40 = 20
      const reading = { h2s: 5, ch4: 0, co: 0, o2: 20.9, co2: 0, nh3: 0 };
      expect(service.calculateGasFactor(reading)).toBe(20);
    });

    it('should return 0 for all-zero readings with normal O2', () => {
      const reading = { h2s: 0, ch4: 0, co: 0, o2: 20.9, co2: 0, nh3: 0 };
      expect(service.calculateGasFactor(reading)).toBe(0);
    });
  });

  describe('isSafeToEnter', () => {
    it('should return false for dangerous reading', async () => {
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce({
        id: 'gas-1',
        manholeId: 'manhole-1',
        h2s: 30,
        ch4: 0,
        co: 0,
        o2: 20.9,
        co2: 0,
        nh3: 0,
        isDangerous: true,
        readAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      } as any);

      const result = await service.isSafeToEnter('manhole-1');

      expect(result).toBe(false);
    });

    it('should return true when no sensor data exists', async () => {
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce(null);

      const result = await service.isSafeToEnter('manhole-no-sensor');

      expect(result).toBe(true);
    });

    it('should return true for stale data (older than 2 hours)', async () => {
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce({
        id: 'gas-old',
        manholeId: 'manhole-2',
        h2s: 25,
        ch4: 6000,
        co: 150,
        o2: 17.0,
        isDangerous: true,
        readAt: new Date(Date.now() - 3 * 3600000), // 3 hours ago
      } as any);

      const result = await service.isSafeToEnter('manhole-2');

      expect(result).toBe(true);
    });

    it('should return true for safe recent reading', async () => {
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce({
        id: 'gas-safe',
        manholeId: 'manhole-3',
        h2s: 3,
        ch4: 200,
        co: 10,
        o2: 20.8,
        co2: 500,
        nh3: 5,
        isDangerous: false,
        readAt: new Date(Date.now() - 10 * 60000), // 10 minutes ago
      } as any);

      const result = await service.isSafeToEnter('manhole-3');

      expect(result).toBe(true);
    });
  });
});
