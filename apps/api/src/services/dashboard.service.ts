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

  /** Real-time live data for dashboard */
  async getLiveData() {
    const [activeEntries, recentAlerts, activeSOS, recentIncidents] = await Promise.all([
      prisma.entryLog.findMany({
        where: { status: 'ACTIVE' },
        include: {
          worker: { select: { name: true, phone: true, employeeId: true } },
          manhole: { select: { area: true, qrCodeId: true, latitude: true, longitude: true } },
        },
        orderBy: { entryTime: 'asc' },
      }),
      prisma.alertRecord.findMany({
        where: { sentAt: { gte: new Date(Date.now() - 3600000) } },
        orderBy: { sentAt: 'desc' },
        take: 20,
      }),
      prisma.sOSRecord.findMany({
        where: { resolvedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.incident.findMany({
        where: { timestamp: { gte: new Date(Date.now() - 24 * 3600000) } },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    return { activeEntries, recentAlerts, activeSOS, recentIncidents };
  }

  /** Area-level summary for map view */
  async getAreaSummary() {
    const manholes = await prisma.manhole.findMany({
      select: {
        id: true, area: true, latitude: true, longitude: true,
        riskLevel: true, riskScore: true, qrCodeId: true,
        _count: { select: { entryLogs: { where: { status: 'ACTIVE' } } } },
      },
    });

    const areaMap = new Map<string, {
      manholes: number; activeEntries: number;
      avgRisk: number; totalRisk: number;
      centerLat: number; centerLng: number;
      latSum: number; lngSum: number;
    }>();

    for (const m of manholes) {
      const existing = areaMap.get(m.area) || {
        manholes: 0, activeEntries: 0, avgRisk: 0, totalRisk: 0,
        centerLat: 0, centerLng: 0, latSum: 0, lngSum: 0,
      };
      existing.manholes++;
      existing.activeEntries += m._count.entryLogs;
      existing.totalRisk += m.riskScore;
      existing.latSum += m.latitude;
      existing.lngSum += m.longitude;
      areaMap.set(m.area, existing);
    }

    return Array.from(areaMap.entries()).map(([area, data]) => ({
      area,
      manholes: data.manholes,
      activeEntries: data.activeEntries,
      avgRiskScore: Math.round((data.totalRisk / data.manholes) * 10) / 10,
      centerLat: data.latSum / data.manholes,
      centerLng: data.lngSum / data.manholes,
    }));
  }

  /** Shift overview for active workers */
  async getShiftOverview() {
    const activeShifts = await prisma.shift.findMany({
      where: { status: 'ACTIVE' },
      include: {
        worker: { select: { name: true, employeeId: true } },
        entryLogs: { where: { status: 'ACTIVE' }, select: { id: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return activeShifts.map((s: any) => ({
      shiftId: s.id,
      workerId: s.workerId,
      workerName: s.worker.name,
      employeeId: s.worker.employeeId,
      startTime: s.startTime,
      entryCount: s.entryCount,
      totalUndergroundMinutes: s.totalUndergroundMinutes,
      fatigueScore: s.fatigueScore,
      activeEntries: s.entryLogs.length,
      shiftHours: Math.round((Date.now() - s.startTime.getTime()) / 3600000 * 10) / 10,
    }));
  }
}
