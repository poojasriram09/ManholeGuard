import { BullWorker, redisConnection } from '../config/bullmq';
import { RiskEngineService } from '../services/risk-engine.service';
import prisma from '../config/database';
import { logger } from '../utils/logger';

const riskEngine = new RiskEngineService();

export const riskRecalculationWorker = new BullWorker(
  'risk-recalculation',
  async (job) => {
    logger.info(`Risk recalculation job started: ${job.id}`);
    const manholes = await prisma.manhole.findMany({ select: { id: true, area: true } });

    let success = 0;
    let failed = 0;

    for (const manhole of manholes) {
      try {
        await riskEngine.predictRisk(manhole.id);
        success++;
      } catch (error) {
        failed++;
        logger.error(`Risk recalc failed for manhole ${manhole.id}:`, error);
      }
    }

    logger.info(`Risk recalculation complete: ${success} ok, ${failed} failed of ${manholes.length}`);
    return { success, failed, total: manholes.length };
  },
  { connection: redisConnection as any, concurrency: 1 }
);

riskRecalculationWorker.on('failed', (job, err) => {
  logger.error(`Risk recalculation job ${job?.id} failed:`, err);
});
