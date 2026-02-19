import prisma from '../config/database';
import { logger } from '../utils/logger';

type ReportType = 'dailyOps' | 'monthlySummary' | 'incidentInvestigation' | 'manholeInspection' | 'workerSafetyCard' | 'annualAudit';

interface ReportParams {
  type: ReportType;
  from?: Date;
  to?: Date;
  manholeId?: string;
  workerId?: string;
  generatedBy: string;
}

export class ReportService {
  async generateReport(params: ReportParams) {
    const { type } = params;

    switch (type) {
      case 'dailyOps':
        return this.generateDailyOps(params);
      case 'monthlySummary':
        return this.generateMonthlySummary(params);
      case 'incidentInvestigation':
        return this.generateIncidentInvestigation(params);
      case 'manholeInspection':
        return this.generateManholeInspection(params);
      case 'workerSafetyCard':
        return this.generateWorkerSafetyCard(params);
      case 'annualAudit':
        return this.generateAnnualAudit(params);
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  private async generateDailyOps(params: ReportParams) {
    const date = params.from || new Date();
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [entries, incidents, alerts, shifts, sosRecords] = await Promise.all([
      prisma.entryLog.findMany({
        where: { entryTime: { gte: dayStart, lte: dayEnd } },
        include: {
          worker: { select: { name: true, employeeId: true } },
          manhole: { select: { area: true, qrCodeId: true } },
        },
      }),
      prisma.incident.findMany({
        where: { timestamp: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.alertRecord.findMany({
        where: { sentAt: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.shift.findMany({
        where: { startTime: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.sOSRecord.findMany({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
      }),
    ]);

    return {
      type: 'dailyOps',
      date: dayStart.toISOString().split('T')[0],
      generatedAt: new Date(),
      generatedBy: params.generatedBy,
      summary: {
        totalEntries: entries.length,
        activeEntries: entries.filter((e: any) => e.status === 'ACTIVE').length,
        completedEntries: entries.filter((e: any) => e.status === 'EXITED').length,
        totalIncidents: incidents.length,
        criticalIncidents: incidents.filter((i: any) => i.severity === 'CRITICAL').length,
        totalAlerts: alerts.length,
        unacknowledgedAlerts: alerts.filter((a: any) => !a.acknowledged).length,
        totalShifts: shifts.length,
        sosEvents: sosRecords.length,
      },
      entries,
      incidents,
      alerts,
    };
  }

  private async generateMonthlySummary(params: ReportParams) {
    const from = params.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = params.to || new Date();

    const [entryCount, incidentCount, alertCount, riskDistribution, workerStats] = await Promise.all([
      prisma.entryLog.count({ where: { entryTime: { gte: from, lte: to } } }),
      prisma.incident.count({ where: { timestamp: { gte: from, lte: to } } }),
      prisma.alertRecord.count({ where: { sentAt: { gte: from, lte: to } } }),
      prisma.manhole.groupBy({ by: ['riskLevel'], _count: true }),
      prisma.worker.count(),
    ]);

    const avgEntriesPerDay = entryCount / Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));

    return {
      type: 'monthlySummary',
      period: { from, to },
      generatedAt: new Date(),
      generatedBy: params.generatedBy,
      summary: {
        totalEntries: entryCount,
        avgEntriesPerDay: Math.round(avgEntriesPerDay * 10) / 10,
        totalIncidents: incidentCount,
        totalAlerts: alertCount,
        totalWorkers: workerStats,
        riskDistribution: riskDistribution.map((r: { riskLevel: string; _count: number }) => ({
          level: r.riskLevel,
          count: r._count,
        })),
      },
    };
  }

  private async generateIncidentInvestigation(params: ReportParams) {
    if (!params.from || !params.to) throw new Error('Date range required for incident investigation');

    const incidents = await prisma.incident.findMany({
      where: {
        timestamp: { gte: params.from, lte: params.to },
        ...(params.manholeId && { manholeId: params.manholeId }),
      },
      include: {
        manhole: true,
        worker: { select: { name: true, employeeId: true } },
      },
      orderBy: { timestamp: 'desc' },
    });

    const sosRecords = await prisma.sOSRecord.findMany({
      where: { createdAt: { gte: params.from, lte: params.to } },
    });

    return {
      type: 'incidentInvestigation',
      period: { from: params.from, to: params.to },
      generatedAt: new Date(),
      generatedBy: params.generatedBy,
      incidents,
      sosRecords,
      summary: {
        total: incidents.length,
        bySeverity: {
          critical: incidents.filter((i: any) => i.severity === 'CRITICAL').length,
          high: incidents.filter((i: any) => i.severity === 'HIGH').length,
          medium: incidents.filter((i: any) => i.severity === 'MEDIUM').length,
          low: incidents.filter((i: any) => i.severity === 'LOW').length,
        },
        resolved: incidents.filter((i: any) => i.resolved).length,
        sosCount: sosRecords.length,
      },
    };
  }

  private async generateManholeInspection(params: ReportParams) {
    if (!params.manholeId) throw new Error('manholeId required for inspection report');

    const manhole = await prisma.manhole.findUnique({
      where: { id: params.manholeId },
      include: {
        riskLogs: { orderBy: { calculatedAt: 'desc' }, take: 10 },
        gasReadings: { orderBy: { readAt: 'desc' }, take: 20 },
        maintenances: { orderBy: { scheduledAt: 'desc' }, take: 10 },
        incidents: { orderBy: { timestamp: 'desc' }, take: 10 },
        blockages: { orderBy: { reportedAt: 'desc' }, take: 10 },
      },
    });

    if (!manhole) throw new Error('Manhole not found');

    const entryHistory = await prisma.entryLog.findMany({
      where: { manholeId: params.manholeId },
      include: { worker: { select: { name: true } } },
      orderBy: { entryTime: 'desc' },
      take: 50,
    });

    return {
      type: 'manholeInspection',
      generatedAt: new Date(),
      generatedBy: params.generatedBy,
      manhole,
      entryHistory,
      summary: {
        totalEntries: entryHistory.length,
        currentRisk: { score: manhole.riskScore, level: manhole.riskLevel },
        recentGasReadings: manhole.gasReadings.length,
        dangerousReadings: manhole.gasReadings.filter((g: any) => g.isDangerous).length,
        maintenanceHistory: manhole.maintenances.length,
        incidentCount: manhole.incidents.length,
      },
    };
  }

  private async generateWorkerSafetyCard(params: ReportParams) {
    if (!params.workerId) throw new Error('workerId required for safety card');

    const worker = await prisma.worker.findUnique({
      where: { id: params.workerId },
      include: {
        certifications: true,
        healthChecks: { orderBy: { completedAt: 'desc' }, take: 10 },
        shifts: { orderBy: { startTime: 'desc' }, take: 30 },
      },
    });

    if (!worker) throw new Error('Worker not found');

    const entries = await prisma.entryLog.findMany({
      where: { workerId: params.workerId },
      include: { manhole: { select: { area: true } } },
      orderBy: { entryTime: 'desc' },
      take: 100,
    });

    const incidents = await prisma.incident.findMany({
      where: { workerId: params.workerId },
      orderBy: { timestamp: 'desc' },
    });

    return {
      type: 'workerSafetyCard',
      generatedAt: new Date(),
      generatedBy: params.generatedBy,
      worker: {
        id: worker.id,
        name: worker.name,
        employeeId: worker.employeeId,
        phone: worker.phone,
        bloodGroup: worker.bloodGroup,
        emergencyContact: worker.emergencyContactName,
        emergencyPhone: worker.emergencyContactPhone,
      },
      certifications: worker.certifications,
      entries: entries.length,
      incidents: incidents.length,
      healthChecks: worker.healthChecks,
      summary: {
        totalEntries: entries.length,
        validCerts: worker.certifications.filter((c: any) => c.isValid).length,
        expiredCerts: worker.certifications.filter((c: any) => !c.isValid).length,
        incidentCount: incidents.length,
        medicalFlags: worker.healthChecks.filter((h: any) => h.needsMedical).length,
      },
    };
  }

  private async generateAnnualAudit(params: ReportParams) {
    const year = params.from?.getFullYear() || new Date().getFullYear();
    const from = new Date(year, 0, 1);
    const to = new Date(year, 11, 31, 23, 59, 59);

    const [entries, incidents, alerts, audits, maintenance] = await Promise.all([
      prisma.entryLog.count({ where: { entryTime: { gte: from, lte: to } } }),
      prisma.incident.findMany({
        where: { timestamp: { gte: from, lte: to } },
        select: { severity: true, resolved: true },
      }),
      prisma.alertRecord.count({ where: { sentAt: { gte: from, lte: to } } }),
      prisma.auditLog.count({ where: { timestamp: { gte: from, lte: to } } }),
      prisma.maintenance.findMany({
        where: { scheduledAt: { gte: from, lte: to } },
        select: { status: true },
      }),
    ]);

    return {
      type: 'annualAudit',
      year,
      generatedAt: new Date(),
      generatedBy: params.generatedBy,
      summary: {
        totalEntries: entries,
        totalIncidents: incidents.length,
        incidentResolutionRate: incidents.length > 0
          ? (incidents.filter((i: any) => i.resolved).length / incidents.length) * 100
          : 100,
        totalAlerts: alerts,
        totalAuditLogs: audits,
        maintenanceCompliance: maintenance.length > 0
          ? (maintenance.filter((m: any) => m.status === 'COMPLETED').length / maintenance.length) * 100
          : 100,
      },
    };
  }
}
