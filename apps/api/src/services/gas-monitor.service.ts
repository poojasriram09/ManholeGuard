import prisma from '../config/database';
import { GAS_THRESHOLDS, OXYGEN_THRESHOLD } from '@manholeguard/shared/src/constants/gas-thresholds';
import { logger } from '../utils/logger';

export class GasMonitorService {
  async recordReading(manholeId: string, reading: {
    h2s?: number; ch4?: number; co?: number; o2?: number; co2?: number; nh3?: number;
    temperature?: number; humidity?: number; source?: string;
  }) {
    const isDangerous = this.evaluateDanger(reading);

    const record = await prisma.gasReading.create({
      data: {
        manholeId,
        h2s: reading.h2s ?? 0,
        ch4: reading.ch4 ?? 0,
        co: reading.co ?? 0,
        o2: reading.o2 ?? 20.9,
        co2: reading.co2 ?? 0,
        nh3: reading.nh3 ?? 0,
        temperature: reading.temperature,
        humidity: reading.humidity,
        isDangerous,
        source: reading.source ?? 'manual',
        alertTriggered: isDangerous,
      },
    });

    if (isDangerous) {
      logger.warn(`Dangerous gas reading at manhole ${manholeId}`, reading);
    }

    return record;
  }

  evaluateDanger(reading: Record<string, any>): boolean {
    for (const [gas, threshold] of Object.entries(GAS_THRESHOLDS)) {
      if (reading[gas] !== undefined && reading[gas] >= threshold.danger) return true;
    }
    if (reading.o2 !== undefined) {
      if (reading.o2 < OXYGEN_THRESHOLD.low || reading.o2 > OXYGEN_THRESHOLD.high) return true;
    }
    return false;
  }

  calculateGasFactor(reading: Record<string, any>): number {
    let maxFactor = 0;

    for (const [gas, threshold] of Object.entries(GAS_THRESHOLDS)) {
      const value = reading[gas] ?? 0;
      if (value >= threshold.danger) return 100;
      if (value >= threshold.warning) maxFactor = Math.max(maxFactor, 60);
      else {
        const normalized = (value / threshold.warning) * 40;
        maxFactor = Math.max(maxFactor, normalized);
      }
    }

    if (reading.o2 !== undefined) {
      if (reading.o2 < OXYGEN_THRESHOLD.low || reading.o2 > OXYGEN_THRESHOLD.high) return 100;
    }

    return Math.round(maxFactor);
  }

  async isSafeToEnter(manholeId: string): Promise<boolean> {
    const latest = await prisma.gasReading.findFirst({
      where: { manholeId },
      orderBy: { readAt: 'desc' },
    });

    if (!latest) return true; // No sensor data

    const ageHours = (Date.now() - latest.readAt.getTime()) / 3600000;
    if (ageHours > 2) return true; // Stale data — require fresh reading

    if (latest.isDangerous) return false;

    return !this.evaluateDanger(latest);
  }

  async getReadings(manholeId: string, hours: number = 24) {
    const since = new Date(Date.now() - hours * 3600000);
    return prisma.gasReading.findMany({
      where: { manholeId, readAt: { gte: since } },
      orderBy: { readAt: 'desc' },
    });
  }

  async getDangerousReadings() {
    return prisma.gasReading.findMany({
      where: { isDangerous: true, readAt: { gte: new Date(Date.now() - 24 * 3600000) } },
      include: { manhole: { select: { area: true, qrCodeId: true } } },
      orderBy: { readAt: 'desc' },
    });
  }
}
