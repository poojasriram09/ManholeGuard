import { Router, Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { TimerMonitorService } from '../services/timer-monitor.service';
import { RiskEngineService } from '../services/risk-engine.service';
import { MaintenanceService } from '../services/maintenance.service';
import { WeatherService } from '../services/weather.service';
import { AlertService } from '../services/alert.service';
import { CertificationService } from '../services/certification.service';
import prisma from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Middleware: verify CRON_SECRET header.
 * cron-job.org sends this as a custom header on each request.
 */
function verifyCronSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-cron-secret'];
  if (secret !== env.CRON_SECRET) {
    res.status(403).json({ success: false, error: 'Invalid cron secret' });
    return;
  }
  next();
}

router.use(verifyCronSecret);

// POST /api/cron/timer-monitor — every 1 minute (safety-critical)
router.post('/timer-monitor', async (_req, res) => {
  try {
    const monitor = new TimerMonitorService();
    await monitor.tick();
    res.json({ success: true, job: 'timer-monitor' });
  } catch (error) {
    logger.error('Cron timer-monitor failed:', error);
    res.status(500).json({ success: false, error: 'timer-monitor failed' });
  }
});

// POST /api/cron/risk-recalculation — every 6 hours
router.post('/risk-recalculation', async (_req, res) => {
  try {
    const riskEngine = new RiskEngineService();
    const manholes = await prisma.manhole.findMany({ select: { id: true } });
    let success = 0;
    let failed = 0;

    for (const manhole of manholes) {
      try {
        await riskEngine.predictRisk(manhole.id);
        success++;
      } catch {
        failed++;
      }
    }

    logger.info(`Cron risk-recalculation: ${success} ok, ${failed} failed of ${manholes.length}`);
    res.json({ success: true, job: 'risk-recalculation', result: { success, failed, total: manholes.length } });
  } catch (error) {
    logger.error('Cron risk-recalculation failed:', error);
    res.status(500).json({ success: false, error: 'risk-recalculation failed' });
  }
});

// POST /api/cron/maintenance — daily at midnight
router.post('/maintenance', async (_req, res) => {
  try {
    const maintenanceService = new MaintenanceService();
    const overdueCount = await maintenanceService.checkOverdue();
    const scheduled = await maintenanceService.autoSchedule();
    logger.info(`Cron maintenance: ${overdueCount} overdue, ${scheduled.length} newly scheduled`);
    res.json({ success: true, job: 'maintenance', result: { overdueCount, newlyScheduled: scheduled.length } });
  } catch (error) {
    logger.error('Cron maintenance failed:', error);
    res.status(500).json({ success: false, error: 'maintenance failed' });
  }
});

// POST /api/cron/weather-alert — every 2 hours
router.post('/weather-alert', async (_req, res) => {
  try {
    const weatherService = new WeatherService();
    const alertService = new AlertService();

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
        }
      } catch (error) {
        logger.error(`Weather check failed for area ${area}:`, error);
      }
    }

    logger.info(`Cron weather-alert: ${checkedAreas.size} areas, ${alertsTriggered} alerts`);
    res.json({ success: true, job: 'weather-alert', result: { areasChecked: checkedAreas.size, alertsTriggered } });
  } catch (error) {
    logger.error('Cron weather-alert failed:', error);
    res.status(500).json({ success: false, error: 'weather-alert failed' });
  }
});

// POST /api/cron/certification-expiry — daily at 6 AM
router.post('/certification-expiry', async (_req, res) => {
  try {
    const certService = new CertificationService();
    const expiringSoon = await certService.checkExpiringCerts();
    logger.info(`Cron certification-expiry: ${expiringSoon.length} expiring soon`);
    res.json({ success: true, job: 'certification-expiry', result: { expiringSoon: expiringSoon.length } });
  } catch (error) {
    logger.error('Cron certification-expiry failed:', error);
    res.status(500).json({ success: false, error: 'certification-expiry failed' });
  }
});

export default router;
