import prisma from '../config/database';

export class DashboardService {
  async getStats() {
    const [activeEntries, totalManholes, totalWorkers, recentIncidents, activeAlerts] = await Promise.all([
      prisma.entryLog.count({ where: { status: 'ACTIVE' } }),
      prisma.manhole.count(),
      prisma.worker.count(),
      prisma.incident.count({ where: { timestamp: { gte: new Date(Date.now() - 24 * 3600000) } } }),
      prisma.sOSRecord.count({ where: { resolvedAt: null } }),
    ]);

    return { activeEntries, totalManholes, totalWorkers, recentIncidents, activeAlerts };
  }
}
