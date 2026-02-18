import prisma from '../config/database';
import { RISK_WEIGHTS } from '@manholeguard/shared/src/constants/risk-levels';
import { RainfallService } from './rainfall.service';
import { GasMonitorService } from './gas-monitor.service';
import { WeatherService } from './weather.service';
import { CertificationService } from './certification.service';
import { FatigueService } from './fatigue.service';
import { ManholeService } from './manhole.service';
import { logger } from '../utils/logger';

interface RiskPrediction {
  manholeId: string;
  riskScore: number;
  riskLevel: 'SAFE' | 'CAUTION' | 'PROHIBITED';
  factors: {
    blockageFrequency: number;
    incidentCount: number;
    rainfallFactor: number;
    areaRisk: number;
    gasFactor: number;
    weatherFactor: number;
  };
  calculatedAt: Date;
}

interface EntryClearance {
  allowed: boolean;
  reason?: string;
  risk?: RiskPrediction;
}

export class RiskEngineService {
  private rainfallService = new RainfallService();
  private gasService = new GasMonitorService();
  private weatherService = new WeatherService();
  private certService = new CertificationService();
  private fatigueService = new FatigueService();
  private manholeService = new ManholeService();

  async predictRisk(manholeId: string): Promise<RiskPrediction> {
    const manhole = await this.manholeService.getById(manholeId);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    // Factor 1: Blockage frequency
    const blockageCount = await prisma.blockage.count({
      where: { manholeId, reportedAt: { gte: thirtyDaysAgo } },
    });
    const blockageFrequency = Math.min(100, blockageCount * 20);

    // Factor 2: Incident count
    const incidentCount = await prisma.incident.count({
      where: { manholeId, timestamp: { gte: thirtyDaysAgo } },
    });
    const incidentFactor = Math.min(100, incidentCount * 15);

    // Factor 3: Rainfall
    let rainfallFactor = 0;
    try {
      rainfallFactor = await this.rainfallService.getRainfallFactor(manhole.latitude, manhole.longitude);
    } catch (e) {
      logger.warn('Failed to fetch rainfall data', e);
    }

    // Factor 4: Area risk
    const areaIncidents = await prisma.incident.count({
      where: { manhole: { area: manhole.area }, timestamp: { gte: thirtyDaysAgo } },
    });
    const areaRisk = Math.min(100, areaIncidents * 10);

    // Factor 5: Gas factor
    let gasFactor = 40; // Default: cautious when no data
    try {
      const latestGas = await prisma.gasReading.findFirst({
        where: { manholeId },
        orderBy: { readAt: 'desc' },
      });
      if (latestGas) {
        if (latestGas.isDangerous) gasFactor = 100;
        else gasFactor = this.gasService.calculateGasFactor(latestGas);
      }
    } catch (e) {
      logger.warn('Failed to assess gas levels', e);
    }

    // Factor 6: Weather factor
    let weatherFactor = 0;
    try {
      weatherFactor = await this.weatherService.getWeatherFactor(manhole.latitude, manhole.longitude);
    } catch (e) {
      logger.warn('Failed to fetch weather data', e);
    }

    // Compute weighted score
    const riskScore = Math.round(
      blockageFrequency * RISK_WEIGHTS.blockageFrequency +
      incidentFactor * RISK_WEIGHTS.incidentCount +
      rainfallFactor * RISK_WEIGHTS.rainfallFactor +
      areaRisk * RISK_WEIGHTS.areaRisk +
      gasFactor * RISK_WEIGHTS.gasFactor +
      weatherFactor * RISK_WEIGHTS.weatherFactor
    );

    const riskLevel = riskScore < 30 ? 'SAFE' : riskScore < 60 ? 'CAUTION' : 'PROHIBITED';

    // Store risk log
    await prisma.riskLog.create({
      data: {
        manholeId,
        riskScore,
        blockageFreq: blockageFrequency,
        incidentCount,
        rainfallFactor,
        areaRisk,
        gasFactor,
        weatherFactor,
        computedLevel: riskLevel,
      },
    });

    // Update manhole
    await prisma.manhole.update({
      where: { id: manholeId },
      data: { riskScore, riskLevel },
    });

    return {
      manholeId,
      riskScore,
      riskLevel,
      factors: { blockageFrequency, incidentCount: incidentFactor, rainfallFactor, areaRisk, gasFactor, weatherFactor },
      calculatedAt: new Date(),
    };
  }

  async canWorkerEnter(manholeId: string, workerId: string): Promise<EntryClearance> {
    const risk = await this.predictRisk(manholeId);

    if (risk.riskLevel === 'PROHIBITED') {
      return { allowed: false, reason: 'RISK_PROHIBITED', risk };
    }

    const certsValid = await this.certService.hasValidCerts(workerId);
    if (!certsValid) return { allowed: false, reason: 'CERTS_EXPIRED', risk };

    const fatigueCheck = await this.fatigueService.canWorkerEnter(workerId);
    if (!fatigueCheck.allowed) return { allowed: false, reason: fatigueCheck.reason, risk };

    const gasOk = await this.gasService.isSafeToEnter(manholeId);
    if (!gasOk) return { allowed: false, reason: 'GAS_UNSAFE', risk };

    const weatherOk = await this.weatherService.isSafeToWork(manholeId);
    if (!weatherOk) return { allowed: false, reason: 'WEATHER_UNSAFE', risk };

    const activeCount = await this.manholeService.getActiveWorkerCount(manholeId);
    const manhole = await this.manholeService.getById(manholeId);
    if (activeCount >= manhole.maxWorkers) {
      return { allowed: false, reason: 'MANHOLE_FULL', risk };
    }

    return { allowed: true, risk };
  }
}
