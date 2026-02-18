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
}
