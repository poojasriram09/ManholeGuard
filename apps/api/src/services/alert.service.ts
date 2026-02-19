import prisma from '../config/database';
import { logger } from '../utils/logger';

export class AlertService {
  async createAlert(entryLogId: string, alertType: string, sentTo: string, channel: string = 'push') {
    return prisma.alertRecord.create({
      data: { entryLogId, alertType, sentTo, channel },
    });
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    return prisma.alertRecord.update({
      where: { id: alertId },
      data: { acknowledged: true, acknowledgedAt: new Date(), acknowledgedBy: userId },
    });
  }

  async getByEntry(entryLogId: string) {
    return prisma.alertRecord.findMany({
      where: { entryLogId },
      orderBy: { sentAt: 'desc' },
    });
  }

  async getRecent(limit: number = 50) {
    return prisma.alertRecord.findMany({
      orderBy: { sentAt: 'desc' },
      take: limit,
    });
  }

  async triggerOverstayAlert(entryLogId: string, supervisorId: string) {
    await prisma.entryLog.update({
      where: { id: entryLogId },
      data: { state: 'OVERSTAY_ALERT', status: 'OVERSTAY_ALERT' },
    });

    await this.createAlert(entryLogId, 'OVERSTAY', supervisorId, 'push');
    logger.warn(`Overstay alert for entry ${entryLogId}`);
  }

  /** Escalate alerts based on elapsed time since first alert */
  async escalateAlert(entryLogId: string, alertType: string) {
    const alerts = await prisma.alertRecord.findMany({
      where: { entryLogId, alertType },
      orderBy: { sentAt: 'asc' },
    });

    if (alerts.length === 0) return;

    const firstAlertTime = alerts[0].sentAt.getTime();
    const elapsed = (Date.now() - firstAlertTime) / 60000;

    const entry = await prisma.entryLog.findUnique({
      where: { id: entryLogId },
      include: { worker: { select: { supervisorId: true } } },
    });
    if (!entry) return;

    // 5 min: re-notify supervisor
    if (elapsed >= 5 && alerts.length < 2) {
      await this.createAlert(entryLogId, `${alertType}_ESCALATED`, entry.worker.supervisorId || 'system', 'push');
      logger.warn(`Alert escalated (5min): entry=${entryLogId} type=${alertType}`);
    }

    // 15 min: notify all admins
    if (elapsed >= 15 && alerts.length < 3) {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true },
      });
      for (const admin of admins) {
        await this.createAlert(entryLogId, `${alertType}_ADMIN_ESCALATED`, admin.id, 'push');
      }
      logger.warn(`Alert escalated to admins (15min): entry=${entryLogId}`);
    }

    // 30 min: auto-SOS
    if (elapsed >= 30) {
      const { SOSService } = await import('./sos.service');
      const sosService = new SOSService();
      await sosService.triggerSOS({
        workerId: entry.workerId,
        entryLogId,
        method: `auto_escalation_${alertType.toLowerCase()}`,
      });
      logger.warn(`Auto-SOS from escalation (30min): entry=${entryLogId}`);
    }
  }

  /** Trigger weather-based area-wide alerts for active entries */
  async triggerWeatherAlert(area: string, message: string) {
    const activeEntries = await prisma.entryLog.findMany({
      where: { status: 'ACTIVE', manhole: { area } },
      include: { worker: { select: { supervisorId: true } } },
    });

    for (const entry of activeEntries) {
      await this.createAlert(entry.id, 'WEATHER_WARNING', entry.worker.supervisorId || 'system', 'push');
    }

    logger.warn(`Weather alert for area ${area}: ${activeEntries.length} active entries notified`);
    return activeEntries.length;
  }

  /** Get alert summary statistics */
  async getAlertSummary(from?: Date, to?: Date) {
    const where = {
      ...(from && { sentAt: { gte: from } }),
      ...(to && { sentAt: { lte: to } }),
    };

    const [total, unacknowledged, byType] = await Promise.all([
      prisma.alertRecord.count({ where }),
      prisma.alertRecord.count({ where: { ...where, acknowledged: false } }),
      prisma.alertRecord.groupBy({
        by: ['alertType'],
        _count: true,
        where,
      }),
    ]);

    // Calculate average response time for acknowledged alerts
    const acknowledgedAlerts = await prisma.alertRecord.findMany({
      where: { ...where, acknowledged: true, acknowledgedAt: { not: null } },
      select: { sentAt: true, acknowledgedAt: true },
    });

    let avgResponseMs = 0;
    if (acknowledgedAlerts.length > 0) {
      const totalMs = acknowledgedAlerts.reduce((sum: number, a: { sentAt: Date; acknowledgedAt: Date | null }) => {
        return sum + (a.acknowledgedAt!.getTime() - a.sentAt.getTime());
      }, 0);
      avgResponseMs = totalMs / acknowledgedAlerts.length;
    }

    return {
      total,
      unacknowledged,
      acknowledgmentRate: total > 0 ? ((total - unacknowledged) / total) * 100 : 100,
      avgResponseTimeSeconds: Math.round(avgResponseMs / 1000),
      byType: byType.map((t: { alertType: string; _count: number }) => ({
        type: t.alertType,
        count: t._count,
      })),
    };
  }
}
