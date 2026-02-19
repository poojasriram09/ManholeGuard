import { BullWorker, redisConnection } from '../config/bullmq';
import { WeatherService } from '../services/weather.service';
import { AlertService } from '../services/alert.service';
import prisma from '../config/database';
import { logger } from '../utils/logger';

const weatherService = new WeatherService();
const alertService = new AlertService();

export const weatherAlertCheckWorker = new BullWorker(
  'weather-alert-check',
  async (job) => {
    logger.info(`Weather alert check started: ${job.id}`);

    // Get distinct areas with active entries
    const activeEntries = await prisma.entryLog.findMany({
      where: { status: 'ACTIVE' },
      include: { manhole: { select: { id: true, area: true, latitude: true, longitude: true } } },
    });

    const checkedAreas = new Set<string>();
    let alertsTriggered = 0;

    for (const entry of activeEntries) {
      const area = entry.manhole.area;
      if (checkedAreas.has(area)) continue;
      checkedAreas.add(area);

      try {
        const isSafe = await weatherService.isSafeToWork(entry.manhole.id);
        if (!isSafe) {
          const count = await alertService.triggerWeatherAlert(
            area,
            'Severe weather conditions detected. Consider evacuating workers.'
          );
          alertsTriggered += count;
          logger.warn(`Weather alert triggered for area ${area}: ${count} entries affected`);
        }
      } catch (error) {
        logger.error(`Weather check failed for area ${area}:`, error);
      }
    }

    logger.info(`Weather alert check done: ${checkedAreas.size} areas checked, ${alertsTriggered} alerts`);
    return { areasChecked: checkedAreas.size, alertsTriggered };
  },
  { connection: redisConnection as any, concurrency: 1 }
);

weatherAlertCheckWorker.on('failed', (job, err) => {
  logger.error(`Weather alert check job ${job?.id} failed:`, err);
});
