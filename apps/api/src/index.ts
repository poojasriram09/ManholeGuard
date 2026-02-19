import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import { scheduledJobsQueue } from './config/bullmq';
import { TimerMonitorService } from './services/timer-monitor.service';
import { logger } from './utils/logger';

// Import BullMQ workers so they start processing
import { riskRecalculationWorker } from './jobs/risk-recalculation.job';
import { reportGenerationWorker } from './jobs/report-generation.job';
import { maintenanceSchedulerWorker } from './jobs/maintenance-scheduler.job';
import { weatherAlertCheckWorker } from './jobs/weather-alert-check.job';
import { certificationExpiryWorker } from './jobs/certification-expiry.job';

const timerMonitor = new TimerMonitorService();

async function scheduleRecurringJobs() {
  // Risk recalculation — every 6 hours
  await scheduledJobsQueue.add('risk-recalculation', {}, {
    repeat: { pattern: '0 */6 * * *' },
    removeOnComplete: 10,
    removeOnFail: 5,
  });

  // Maintenance scheduler — daily at midnight
  await scheduledJobsQueue.add('maintenance-scheduler', {}, {
    repeat: { pattern: '0 0 * * *' },
    removeOnComplete: 10,
    removeOnFail: 5,
  });

  // Weather alert check — every 2 hours
  await scheduledJobsQueue.add('weather-alert-check', {}, {
    repeat: { pattern: '0 */2 * * *' },
    removeOnComplete: 10,
    removeOnFail: 5,
  });

  // Certification expiry — daily at 6 AM
  await scheduledJobsQueue.add('certification-expiry', {}, {
    repeat: { pattern: '0 6 * * *' },
    removeOnComplete: 10,
    removeOnFail: 5,
  });

  logger.info('Recurring BullMQ jobs scheduled');
}

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    // Start timer monitor (dead man's switch heartbeat)
    timerMonitor.start();

    // Schedule recurring background jobs
    await scheduleRecurringJobs();

    const server = app.listen(env.PORT, () => {
      logger.info(`ManholeGuard API running on port ${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      // Stop the timer monitor
      timerMonitor.stop();

      // Close BullMQ workers
      await Promise.allSettled([
        riskRecalculationWorker.close(),
        reportGenerationWorker.close(),
        maintenanceSchedulerWorker.close(),
        weatherAlertCheckWorker.close(),
        certificationExpiryWorker.close(),
      ]);
      logger.info('BullMQ workers closed');

      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server shut down');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
