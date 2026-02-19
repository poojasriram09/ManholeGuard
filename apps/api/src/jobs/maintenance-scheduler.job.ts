import { BullWorker, redisConnection } from '../config/bullmq';
import { MaintenanceService } from '../services/maintenance.service';
import { logger } from '../utils/logger';

const maintenanceService = new MaintenanceService();

export const maintenanceSchedulerWorker = new BullWorker(
  'maintenance-scheduler',
  async (job) => {
    logger.info(`Maintenance scheduler job started: ${job.id}`);

    // Check overdue maintenance
    const overdueCount = await maintenanceService.checkOverdue();

    // Auto-schedule new maintenance
    const scheduled = await maintenanceService.autoSchedule();

    logger.info(`Maintenance scheduler done: ${overdueCount} overdue, ${scheduled.length} newly scheduled`);
    return { overdueCount, newlyScheduled: scheduled.length };
  },
  { connection: redisConnection as any, concurrency: 1 }
);

maintenanceSchedulerWorker.on('failed', (job, err) => {
  logger.error(`Maintenance scheduler job ${job?.id} failed:`, err);
});
