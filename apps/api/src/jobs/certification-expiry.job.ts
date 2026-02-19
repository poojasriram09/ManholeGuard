import { BullWorker, redisConnection } from '../config/bullmq';
import { CertificationService } from '../services/certification.service';
import { NotificationService } from '../services/notification.service';
import prisma from '../config/database';
import { logger } from '../utils/logger';

const certService = new CertificationService();
const notificationService = new NotificationService();

export const certificationExpiryWorker = new BullWorker(
  'certification-expiry',
  async (job) => {
    logger.info(`Certification expiry check started: ${job.id}`);

    // Mark expired certs and get expiring ones
    const expiringSoon = await certService.checkExpiringCerts();

    // Notify workers with expiring certs
    for (const cert of expiringSoon) {
      const worker = cert.worker;
      if (!worker) continue;

      const daysLeft = Math.ceil((cert.expiresAt.getTime() - Date.now()) / 86400000);

      // Look up an active entry for the notification (if any)
      const activeEntry = await prisma.entryLog.findFirst({
        where: { workerId: worker.id, status: 'ACTIVE' },
      });

      if (activeEntry) {
        await notificationService.sendAlert({
          type: 'CERT_EXPIRING',
          entryLogId: activeEntry.id,
          workerId: worker.id,
          message: `Your ${cert.type} certification expires in ${daysLeft} days. Renew immediately to continue working.`,
          priority: daysLeft <= 3 ? 'high' : 'normal',
        });
      }
    }

    // Block workers with expired mandatory certs from active entries
    const expiredWorkers = await prisma.workerCertification.findMany({
      where: { isValid: false, expiresAt: { lt: new Date() } },
      select: { workerId: true },
      distinct: ['workerId'],
    });

    logger.info(`Certification check done: ${expiringSoon.length} expiring soon, ${expiredWorkers.length} workers with expired certs`);
    return { expiringSoon: expiringSoon.length, expiredWorkers: expiredWorkers.length };
  },
  { connection: redisConnection as any, concurrency: 1 }
);

certificationExpiryWorker.on('failed', (job, err) => {
  logger.error(`Certification expiry job ${job?.id} failed:`, err);
});
