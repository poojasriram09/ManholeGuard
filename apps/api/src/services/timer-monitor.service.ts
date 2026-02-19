import prisma from '../config/database';
import { env } from '../config/env';
import { CheckInService } from './checkin.service';
import { SOSService } from './sos.service';
import { AlertService } from './alert.service';
import { NotificationService } from './notification.service';
import { GasMonitorService } from './gas-monitor.service';
import { logger } from '../utils/logger';

export class TimerMonitorService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private checkInService = new CheckInService();
  private sosService = new SOSService();
  private alertService = new AlertService();
  private notificationService = new NotificationService();
  private gasService = new GasMonitorService();

  start() {
    if (this.intervalId) return;
    const intervalMs = env.ALERT_CHECK_INTERVAL_MS;
    logger.info(`TimerMonitor started — polling every ${intervalMs}ms`);

    this.intervalId = setInterval(() => this.tick(), intervalMs);
    // Run immediately on start
    this.tick();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('TimerMonitor stopped');
    }
  }

  private async tick() {
    try {
      await Promise.allSettled([
        this.checkActiveEntries(),
        this.checkPendingCheckIns(),
        this.checkMissedCheckIns(),
        this.checkGasAlerts(),
      ]);
    } catch (error) {
      logger.error('TimerMonitor tick error:', error);
    }
  }

  /** Detect entries that exceeded their allowed duration */
  async checkActiveEntries() {
    const activeEntries = await prisma.entryLog.findMany({
      where: { status: 'ACTIVE', state: { in: ['ENTERED', 'ACTIVE'] } },
      include: {
        worker: { select: { id: true, name: true, supervisorId: true } },
        manhole: { select: { id: true, area: true } },
      },
    });

    const now = Date.now();

    for (const entry of activeEntries) {
      const elapsedMinutes = (now - entry.entryTime.getTime()) / 60000;

      if (elapsedMinutes > entry.allowedDurationMinutes) {
        logger.warn(`Overstay detected: entry=${entry.id} elapsed=${Math.round(elapsedMinutes)}min allowed=${entry.allowedDurationMinutes}min`);

        await this.alertService.triggerOverstayAlert(
          entry.id,
          entry.worker.supervisorId || 'system'
        );

        await this.notificationService.sendAlert({
          type: 'OVERSTAY',
          entryLogId: entry.id,
          workerId: entry.workerId,
          supervisorId: entry.worker.supervisorId || undefined,
          message: `Worker ${entry.worker.name} has overstayed in manhole at ${entry.manhole.area}. Elapsed: ${Math.round(elapsedMinutes)} min (limit: ${entry.allowedDurationMinutes} min).`,
        });

        // Escalate long overstays
        const overstayMinutes = elapsedMinutes - entry.allowedDurationMinutes;
        if (overstayMinutes >= 30) {
          await this.alertService.escalateAlert(entry.id, 'OVERSTAY');
        }
      }
    }
  }

  /** Prompt check-ins for entries past the check-in interval */
  async checkPendingCheckIns() {
    const activeEntries = await prisma.entryLog.findMany({
      where: { status: 'ACTIVE', state: { in: ['ENTERED', 'ACTIVE'] } },
      include: {
        checkIns: { orderBy: { promptedAt: 'desc' }, take: 1 },
      },
    });

    const now = Date.now();
    const intervalMs = env.CHECKIN_INTERVAL_MINUTES * 60000;

    for (const entry of activeEntries) {
      const lastPrompt = entry.checkIns[0]?.promptedAt;
      const lastPromptTime = lastPrompt ? lastPrompt.getTime() : entry.entryTime.getTime();

      if (now - lastPromptTime >= intervalMs) {
        // Check if there's already an unanswered check-in
        const pending = entry.checkIns[0];
        if (pending && !pending.respondedAt) {
          continue; // Already has unanswered prompt
        }

        const checkIn = await this.checkInService.promptCheckIn(entry.id, entry.workerId);
        logger.info(`Check-in prompted: entry=${entry.id} checkIn=${checkIn.id}`);

        await this.notificationService.sendCheckInPrompt(entry.workerId, entry.id, checkIn.id);
      }
    }
  }

  /** Evaluate consecutive missed check-ins, 3+ → auto SOS */
  async checkMissedCheckIns() {
    const activeEntries = await prisma.entryLog.findMany({
      where: { status: 'ACTIVE', state: { in: ['ENTERED', 'ACTIVE', 'CHECKIN_MISSED'] } },
    });

    for (const entry of activeEntries) {
      const missedCount = await this.checkInService.getConsecutiveMissedCount(entry.id);

      if (missedCount >= 3 && entry.state !== 'SOS_TRIGGERED') {
        logger.warn(`Auto-SOS: entry=${entry.id} missed=${missedCount}`);

        await this.sosService.triggerSOS({
          workerId: entry.workerId,
          entryLogId: entry.id,
          method: 'auto_missed_checkin',
        });

        await this.notificationService.broadcastSOS(entry.id, entry.workerId, 'AUTO_MISSED_CHECKIN');
      } else if (missedCount >= env.MISSED_CHECKIN_ALERT_THRESHOLD && entry.state !== 'CHECKIN_MISSED') {
        await this.checkInService.handleMissedCheckIn(entry.id);

        await this.notificationService.sendAlert({
          type: 'CHECKIN_MISSED',
          entryLogId: entry.id,
          workerId: entry.workerId,
          message: `Worker has missed ${missedCount} consecutive check-ins.`,
        });
      }
    }
  }

  /** Check latest gas readings for active entries */
  async checkGasAlerts() {
    const activeEntries = await prisma.entryLog.findMany({
      where: { status: 'ACTIVE', state: { notIn: ['SOS_TRIGGERED', 'GAS_ALERT'] } },
      include: {
        manhole: { select: { id: true, hasGasSensor: true, area: true } },
        worker: { select: { id: true, name: true, supervisorId: true } },
      },
    });

    for (const entry of activeEntries) {
      if (!entry.manhole.hasGasSensor) continue;

      const latest = await prisma.gasReading.findFirst({
        where: { manholeId: entry.manholeId },
        orderBy: { readAt: 'desc' },
      });

      if (!latest) continue;

      // Only consider readings from last 10 minutes
      const ageMinutes = (Date.now() - latest.readAt.getTime()) / 60000;
      if (ageMinutes > 10) continue;

      if (latest.isDangerous) {
        logger.warn(`Gas alert: entry=${entry.id} manhole=${entry.manholeId}`);

        await prisma.entryLog.update({
          where: { id: entry.id },
          data: { state: 'GAS_ALERT' },
        });

        await this.alertService.createAlert(
          entry.id,
          'GAS_DANGEROUS',
          entry.worker.supervisorId || 'system',
          'push'
        );

        await this.notificationService.sendAlert({
          type: 'GAS_ALERT',
          entryLogId: entry.id,
          workerId: entry.workerId,
          supervisorId: entry.worker.supervisorId || undefined,
          message: `DANGEROUS gas levels detected at ${entry.manhole.area}. Worker ${entry.worker.name} must evacuate immediately.`,
          priority: 'critical',
        });
      }
    }
  }
}
