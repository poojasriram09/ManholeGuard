import prisma from '../config/database';

export class AnalyticsService {
  async getOverviewStats(from?: Date, to?: Date) {
    const [totalEntries, activeEntries, totalIncidents, totalAlerts] = await Promise.all([
      prisma.entryLog.count({ where: from ? { entryTime: { gte: from, ...(to && { lte: to }) } } : undefined }),
      prisma.entryLog.count({ where: { status: 'ACTIVE' } }),
      prisma.incident.count({ where: from ? { timestamp: { gte: from, ...(to && { lte: to }) } } : undefined }),
      prisma.alertRecord.count({ where: from ? { sentAt: { gte: from, ...(to && { lte: to }) } } : undefined }),
    ]);

    const riskDistribution = await prisma.manhole.groupBy({
      by: ['riskLevel'],
      _count: true,
    });

    return {
      totalEntries,
      activeEntries,
      totalIncidents,
      totalAlerts,
      riskDistribution: riskDistribution.map((r: { riskLevel: string; _count: number }) => ({ level: r.riskLevel, count: r._count })),
    };
  }

  async getWorkerPerformance(from?: Date, to?: Date) {
    const workers = await prisma.worker.findMany({
      include: {
        entryLogs: {
          where: from ? { entryTime: { gte: from, ...(to && { lte: to }) } } : undefined,
          select: { id: true, status: true, checklistCompleted: true, entryTime: true, exitTime: true },
        },
        healthChecks: {
          where: from ? { completedAt: { gte: from } } : undefined,
          select: { needsMedical: true },
        },
      },
    });

    return workers.map((w: any) => ({
      workerId: w.id,
      name: w.name,
      totalEntries: w.entryLogs.length,
      checklistCompliance: w.entryLogs.length > 0
        ? w.entryLogs.filter((e: any) => e.checklistCompleted).length / w.entryLogs.length
        : 1,
      medicalFlags: w.healthChecks.filter((h: any) => h.needsMedical).length,
    }));
  }

  /** Area-level analytics */
  async getAreaAnalytics(from?: Date, to?: Date) {
    const manholes = await prisma.manhole.findMany({
      include: {
        entryLogs: {
          where: from ? { entryTime: { gte: from, ...(to && { lte: to }) } } : undefined,
          select: { id: true },
        },
        incidents: {
          where: from ? { timestamp: { gte: from, ...(to && { lte: to }) } } : undefined,
          select: { id: true, severity: true },
        },
      },
    });

    const areaMap = new Map<string, { entries: number; incidents: number; manholes: number; avgRisk: number; totalRisk: number }>();

    for (const m of manholes) {
      const area = m.area;
      const existing = areaMap.get(area) || { entries: 0, incidents: 0, manholes: 0, avgRisk: 0, totalRisk: 0 };
      existing.entries += m.entryLogs.length;
      existing.incidents += m.incidents.length;
      existing.manholes += 1;
      existing.totalRisk += m.riskScore;
      areaMap.set(area, existing);
    }

    return Array.from(areaMap.entries()).map(([area, data]) => ({
      area,
      manholes: data.manholes,
      entries: data.entries,
      incidents: data.incidents,
      avgRiskScore: Math.round((data.totalRisk / data.manholes) * 10) / 10,
    }));
  }

  /** Entry trends by day */
  async getEntryTrends(days: number = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const entries = await prisma.entryLog.findMany({
      where: { entryTime: { gte: since } },
      select: { entryTime: true },
      orderBy: { entryTime: 'asc' },
    });

    const dayMap = new Map<string, number>();
    for (const e of entries) {
      const day = e.entryTime.toISOString().split('T')[0];
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }

    return Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));
  }

  /** Gas reading trends */
  async getGasTrends(manholeId: string, days: number = 7) {
    const since = new Date(Date.now() - days * 86400000);
    return prisma.gasReading.findMany({
      where: { manholeId, readAt: { gte: since } },
      select: { readAt: true, h2s: true, ch4: true, co: true, o2: true, isDangerous: true },
      orderBy: { readAt: 'asc' },
    });
  }

  /** Compliance metrics */
  async getComplianceMetrics(from?: Date, to?: Date) {
    const entries = await prisma.entryLog.findMany({
      where: from ? { entryTime: { gte: from, ...(to && { lte: to }) } } : undefined,
      select: { checklistCompleted: true, geoVerified: true },
    });

    const total = entries.length || 1;
    const checklistRate = (entries.filter((e: any) => e.checklistCompleted).length / total) * 100;
    const geoVerifyRate = (entries.filter((e: any) => e.geoVerified).length / total) * 100;

    const alerts = await prisma.alertRecord.findMany({
      where: from ? { sentAt: { gte: from, ...(to && { lte: to }) } } : undefined,
      select: { acknowledged: true },
    });

    const alertTotal = alerts.length || 1;
    const ackRate = (alerts.filter((a: any) => a.acknowledged).length / alertTotal) * 100;

    const certs = await prisma.workerCertification.findMany({
      select: { isValid: true },
    });
    const certTotal = certs.length || 1;
    const certCompliance = (certs.filter((c: any) => c.isValid).length / certTotal) * 100;

    return {
      checklistComplianceRate: Math.round(checklistRate * 10) / 10,
      geoVerificationRate: Math.round(geoVerifyRate * 10) / 10,
      alertAcknowledgmentRate: Math.round(ackRate * 10) / 10,
      certificationComplianceRate: Math.round(certCompliance * 10) / 10,
    };
  }

  /** Overall safety score (0-100) */
  async getSafetyScore(from?: Date, to?: Date): Promise<number> {
    const metrics = await this.getComplianceMetrics(from, to);

    const score =
      metrics.checklistComplianceRate * 0.3 +
      metrics.geoVerificationRate * 0.2 +
      metrics.alertAcknowledgmentRate * 0.25 +
      metrics.certificationComplianceRate * 0.25;

    return Math.round(score * 10) / 10;
  }
}
