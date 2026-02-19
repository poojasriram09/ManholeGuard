import { BullWorker, redisConnection } from '../config/bullmq';
import { ReportService } from '../services/report.service';
import { logger } from '../utils/logger';

const reportService = new ReportService();

export const reportGenerationWorker = new BullWorker(
  'reports',
  async (job) => {
    const { type, from, to, manholeId, workerId, generatedBy } = job.data;
    logger.info(`Report generation started: type=${type} job=${job.id}`);

    const report = await reportService.generateReport({
      type,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      manholeId,
      workerId,
      generatedBy,
    });

    logger.info(`Report generated: type=${type}`);
    return report;
  },
  { connection: redisConnection as any, concurrency: 2 }
);

reportGenerationWorker.on('failed', (job, err) => {
  logger.error(`Report generation job ${job?.id} failed:`, err);
});
