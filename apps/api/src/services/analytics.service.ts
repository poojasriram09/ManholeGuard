import prisma from '../config/database';

export class AnalyticsService {
  async getOverviewStats(from?: Date, to?: Date) {
    const where = {
      ...(from && { createdAt: { gte: from } }),
      ...(to && { createdAt: { lte: to } }),
    };

    const [totalEntries, activeEntries, totalIncidents, totalAlerts] = await Promise.all([
      prisma.entryLog.count({ where: from ? { entryTime: { gte: from, ...(to && { lte: to }) } } : undefined }),
      prisma.entryLog.count({ where: { status: 'ACTIVE' } }),
      prisma.incident.count({ where: from ? { timestamp: { gte: from, ...(to && { lte: to }) } } : undefined }),
      prisma.alertRecord.count({ where: from ? { sentAt: { gte: from, ...(to && { lte: to }) } } : undefined }),
    ]);

    const checklistCompliance = await prisma.entryLog.aggregate({
      _avg: { allowedDurationMinutes: true },
      where: { checklistCompleted: true, ...(from && { entryTime: { gte: from } }) },
    });

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
}
