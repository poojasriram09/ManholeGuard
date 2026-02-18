import prisma from '../config/database';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class CheckInService {
  async promptCheckIn(entryLogId: string, workerId: string) {
    return prisma.checkIn.create({
      data: { entryLogId, workerId, promptedAt: new Date() },
    });
  }

  async respondToCheckIn(checkInId: string, method: string = 'tap') {
    const checkIn = await prisma.checkIn.findUnique({ where: { id: checkInId } });
    if (!checkIn) throw new Error('Check-in not found');

    const now = new Date();
    const graceMs = env.CHECKIN_GRACE_PERIOD_SECONDS * 1000;
    const wasOnTime = (now.getTime() - checkIn.promptedAt.getTime()) <= graceMs;

    return prisma.checkIn.update({
      where: { id: checkInId },
      data: { respondedAt: now, wasOnTime, method },
    });
  }

  async getConsecutiveMissedCount(entryLogId: string): Promise<number> {
    const checkIns = await prisma.checkIn.findMany({
      where: { entryLogId },
      orderBy: { promptedAt: 'desc' },
    });

    let missed = 0;
    for (const ci of checkIns) {
      if (!ci.respondedAt || !ci.wasOnTime) missed++;
      else break;
    }
    return missed;
  }

  async handleMissedCheckIn(entryLogId: string) {
    const missedCount = await this.getConsecutiveMissedCount(entryLogId);
    const entry = await prisma.entryLog.findUnique({ where: { id: entryLogId } });
    if (!entry) return;

    if (missedCount >= 3) {
      logger.warn(`3+ missed check-ins for entry ${entryLogId} — triggering SOS`);
      await prisma.entryLog.update({
        where: { id: entryLogId },
        data: { state: 'SOS_TRIGGERED' },
      });
    } else if (missedCount >= env.MISSED_CHECKIN_ALERT_THRESHOLD) {
      logger.warn(`${missedCount} missed check-ins for entry ${entryLogId}`);
      await prisma.entryLog.update({
        where: { id: entryLogId },
        data: { state: 'CHECKIN_MISSED' },
      });
    }
  }

  async getCheckInsByEntry(entryLogId: string) {
    return prisma.checkIn.findMany({
      where: { entryLogId },
      orderBy: { promptedAt: 'desc' },
    });
  }
}
