import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    blockage: { count: vi.fn() },
    incident: { count: vi.fn() },
    gasReading: { findFirst: vi.fn() },
    riskLog: { create: vi.fn() },
    manhole: { update: vi.fn() },
  },
}));

vi.mock('../../config/env', () => ({
  env: {
    OPENMETEO_BASE_URL: 'https://api.open-meteo.com/v1/forecast',
    MAX_ENTRIES_PER_SHIFT: 4,
    MAX_UNDERGROUND_MINUTES_PER_SHIFT: 120,
    MIN_REST_BETWEEN_ENTRIES_MINUTES: 15,
    MAX_SHIFT_HOURS: 10,
    ALERT_SMS_ENABLED: false,
    VAPID_PUBLIC_KEY: '',
    VAPID_PRIVATE_KEY: '',
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('@manholeguard/shared/src/constants/risk-levels', () => ({
  RISK_WEIGHTS: {
    blockageFrequency: 0.25,
    incidentCount: 0.20,
    rainfallFactor: 0.15,
    areaRisk: 0.10,
    gasFactor: 0.20,
    weatherFactor: 0.10,
  },
}));

vi.mock('../../services/rainfall.service', () => ({
  RainfallService: vi.fn().mockImplementation(() => ({
    getRainfallFactor: vi.fn().mockResolvedValue(0),
  })),
}));

vi.mock('../../services/gas-monitor.service', () => ({
  GasMonitorService: vi.fn().mockImplementation(() => ({
    calculateGasFactor: vi.fn().mockReturnValue(0),
    isSafeToEnter: vi.fn().mockResolvedValue(true),
  })),
}));

vi.mock('../../services/weather.service', () => ({
  WeatherService: vi.fn().mockImplementation(() => ({
    getWeatherFactor: vi.fn().mockResolvedValue(0),
    isSafeToWork: vi.fn().mockResolvedValue(true),
  })),
}));

vi.mock('../../services/certification.service', () => ({
  CertificationService: vi.fn().mockImplementation(() => ({
    hasValidCerts: vi.fn().mockResolvedValue(true),
  })),
}));

vi.mock('../../services/fatigue.service', () => ({
  FatigueService: vi.fn().mockImplementation(() => ({
    canWorkerEnter: vi.fn().mockResolvedValue({ allowed: true }),
  })),
}));

vi.mock('../../services/manhole.service', () => ({
  ManholeService: vi.fn().mockImplementation(() => ({
    getById: vi.fn().mockResolvedValue({
      id: 'manhole-1',
      latitude: 19.076,
      longitude: 72.877,
      area: 'Dadar West',
      maxWorkers: 2,
    }),
    getActiveWorkerCount: vi.fn().mockResolvedValue(0),
  })),
}));

import prisma from '../../config/database';
import { RiskEngineService } from '../../services/risk-engine.service';

describe('RiskEngineService', () => {
  let service: RiskEngineService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RiskEngineService();

    vi.mocked(prisma.riskLog.create).mockResolvedValue({} as any);
    vi.mocked(prisma.manhole.update).mockResolvedValue({} as any);
  });

  describe('predictRisk', () => {
    it('should calculate weighted risk score correctly', async () => {
      // blockageCount=2 -> freq=40, incidentCount=3 -> factor=45
      // rainfall=0, areaIncidents=1 -> areaRisk=10
      // no gas reading -> gasFactor=40 (default), weather=0
      vi.mocked(prisma.blockage.count).mockResolvedValueOnce(2);
      vi.mocked(prisma.incident.count)
        .mockResolvedValueOnce(3)  // manhole incidents
        .mockResolvedValueOnce(1); // area incidents
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce(null);

      const result = await service.predictRisk('manhole-1');

      // score = 40*0.25 + 45*0.20 + 0*0.15 + 10*0.10 + 40*0.20 + 0*0.10
      //       = 10 + 9 + 0 + 1 + 8 + 0 = 28
      expect(result.riskScore).toBe(28);
      expect(result.riskLevel).toBe('SAFE');
      expect(result.factors.blockageFrequency).toBe(40);
      expect(result.factors.incidentCount).toBe(45);
      expect(result.factors.gasFactor).toBe(40);
      expect(result.manholeId).toBe('manhole-1');

      expect(prisma.riskLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          manholeId: 'manhole-1',
          riskScore: 28,
          computedLevel: 'SAFE',
        }),
      });
    });

    it('should return PROHIBITED for score >= 60', async () => {
      // blockageCount=5 -> freq=100, incidentCount=5 -> factor=75
      // rainfall=80, areaIncidents=5 -> areaRisk=50
      // gas=100 (dangerous), weather=50
      vi.mocked(prisma.blockage.count).mockResolvedValueOnce(5);
      vi.mocked(prisma.incident.count)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(5);
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce({
        isDangerous: true,
        h2s: 25, ch4: 0, co: 0, o2: 20.9,
      } as any);

      const rainfallService = (service as any).rainfallService;
      rainfallService.getRainfallFactor.mockResolvedValueOnce(80);

      const weatherService = (service as any).weatherService;
      weatherService.getWeatherFactor.mockResolvedValueOnce(50);

      const result = await service.predictRisk('manhole-1');

      // score = 100*0.25 + 75*0.20 + 80*0.15 + 50*0.10 + 100*0.20 + 50*0.10
      //       = 25 + 15 + 12 + 5 + 20 + 5 = 82
      expect(result.riskScore).toBe(82);
      expect(result.riskLevel).toBe('PROHIBITED');
    });

    it('should return SAFE for score < 30', async () => {
      vi.mocked(prisma.blockage.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.incident.count)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce({
        isDangerous: false,
        h2s: 2, ch4: 100, co: 5, o2: 20.9,
      } as any);

      const gasService = (service as any).gasService;
      gasService.calculateGasFactor.mockReturnValueOnce(10);

      const result = await service.predictRisk('manhole-1');

      // score = 0*0.25 + 0*0.20 + 0*0.15 + 0*0.10 + 10*0.20 + 0*0.10
      //       = 0 + 0 + 0 + 0 + 2 + 0 = 2
      expect(result.riskScore).toBe(2);
      expect(result.riskLevel).toBe('SAFE');
    });

    it('should return CAUTION for score between 30 and 59', async () => {
      // blockageCount=3 -> freq=60, incidentCount=2 -> factor=30
      // rainfall=40, areaIncidents=3 -> areaRisk=30
      // gas=40 (default), weather=20
      vi.mocked(prisma.blockage.count).mockResolvedValueOnce(3);
      vi.mocked(prisma.incident.count)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3);
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce(null);

      const rainfallService = (service as any).rainfallService;
      rainfallService.getRainfallFactor.mockResolvedValueOnce(40);

      const weatherService = (service as any).weatherService;
      weatherService.getWeatherFactor.mockResolvedValueOnce(20);

      const result = await service.predictRisk('manhole-1');

      // score = 60*0.25 + 30*0.20 + 40*0.15 + 30*0.10 + 40*0.20 + 20*0.10
      //       = 15 + 6 + 6 + 3 + 8 + 2 = 40
      expect(result.riskScore).toBe(40);
      expect(result.riskLevel).toBe('CAUTION');
    });
  });

  describe('canWorkerEnter', () => {
    it('should deny entry when risk is PROHIBITED', async () => {
      // Make risk PROHIBITED
      vi.mocked(prisma.blockage.count).mockResolvedValueOnce(5);
      vi.mocked(prisma.incident.count)
        .mockResolvedValueOnce(7)
        .mockResolvedValueOnce(10);
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce({
        isDangerous: true,
      } as any);

      const rainfallService = (service as any).rainfallService;
      rainfallService.getRainfallFactor.mockResolvedValueOnce(100);
      const weatherService = (service as any).weatherService;
      weatherService.getWeatherFactor.mockResolvedValueOnce(100);

      const result = await service.canWorkerEnter('manhole-1', 'worker-1');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('RISK_PROHIBITED');
      expect(result.risk).toBeDefined();
      expect(result.risk!.riskLevel).toBe('PROHIBITED');
    });

    it('should allow entry when all conditions met', async () => {
      // Low risk: all zeros
      vi.mocked(prisma.blockage.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.incident.count)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      vi.mocked(prisma.gasReading.findFirst).mockResolvedValueOnce(null);

      const result = await service.canWorkerEnter('manhole-1', 'worker-1');

      // Default gasFactor=40, score = 40*0.20 = 8 -> SAFE
      expect(result.allowed).toBe(true);
      expect(result.risk).toBeDefined();
      expect(result.risk!.riskLevel).toBe('SAFE');
    });
  });
});
