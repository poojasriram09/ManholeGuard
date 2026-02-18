import prisma from '../config/database';
import { HEALTH_SYMPTOMS } from '@manholeguard/shared/src/constants/fatigue-limits';
import { logger } from '../utils/logger';

export class HealthCheckService {
  async recordHealthCheck(data: {
    entryLogId: string; workerId?: string; feelingOk: boolean;
    symptoms: string[]; photoUrl?: string; notes?: string;
  }) {
    const entry = await prisma.entryLog.findUnique({ where: { id: data.entryLogId } });
    if (!entry) throw new Error('Entry not found');

    const needsMedical = data.symptoms.some(s =>
      HEALTH_SYMPTOMS.find(def => def.id === s)?.serious
    );

    const record = await prisma.healthCheck.create({
      data: {
        entryLogId: data.entryLogId,
        workerId: data.workerId || entry.workerId,
        feelingOk: data.feelingOk,
        symptoms: data.symptoms,
        photoUrl: data.photoUrl,
        notes: data.notes,
        needsMedical,
      },
    });

    if (needsMedical) {
      logger.warn(`Medical attention needed for worker ${record.workerId} after entry ${data.entryLogId}`);
    }

    return record;
  }

  async getWorkerHealthTrend(workerId: string, days: number = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const checks = await prisma.healthCheck.findMany({
      where: { workerId, completedAt: { gte: since } },
    });

    const symptomFrequency: Record<string, number> = {};
    let symptomaticCount = 0;

    for (const check of checks) {
      if (!check.feelingOk || check.symptoms.length > 0) symptomaticCount++;
      for (const s of check.symptoms) {
        symptomFrequency[s] = (symptomFrequency[s] || 0) + 1;
      }
    }

    return {
      totalChecks: checks.length,
      symptomaticCount,
      symptomFrequency,
      needsAttention: symptomaticCount > 3,
    };
  }
}
