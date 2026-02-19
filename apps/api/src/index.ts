import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import app from './app';
import prisma from './config/database';
import { TimerMonitorService } from './services/timer-monitor.service';
import { RiskEngineService } from './services/risk-engine.service';
import { MaintenanceService } from './services/maintenance.service';
import { WeatherService } from './services/weather.service';
import { AlertService } from './services/alert.service';
import { CertificationService } from './services/certification.service';
import { logger } from './utils/logger';

// Set global options for all functions
setGlobalOptions({ region: 'asia-south1' });

// ── Main API (Express) ──
// minInstances: 1 eliminates cold starts for safety-critical endpoints
export const api = onRequest(
  { minInstances: 1, timeoutSeconds: 60, memory: '512MiB' },
  app
);

// ── Scheduled Functions (replacing BullMQ) ──

// Timer monitor — safety-critical dead man's switch (every 1 minute)
export const timerMonitor = onSchedule(
  { schedule: 'every 1 minutes', timeoutSeconds: 55, memory: '256MiB' },
  async () => {
    const monitor = new TimerMonitorService();
    await monitor.tick();
    logger.info('Timer monitor tick completed');
  }
);

// Risk recalculation — every 6 hours
export const riskRecalculation = onSchedule(
  { schedule: 'every 6 hours', timeoutSeconds: 300, memory: '512MiB' },
  async () => {
    const riskEngine = new RiskEngineService();
    const manholes = await prisma.manhole.findMany({ select: { id: true } });
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
  }
);

// Maintenance scheduler — daily at midnight IST (18:30 UTC)
export const maintenanceScheduler = onSchedule(
  { schedule: 'every day 18:30', timeZone: 'Asia/Kolkata', timeoutSeconds: 120, memory: '256MiB' },
  async () => {
    const maintenanceService = new MaintenanceService();
    const overdueCount = await maintenanceService.checkOverdue();
    const scheduled = await maintenanceService.autoSchedule();
    logger.info(`Maintenance scheduler: ${overdueCount} overdue, ${scheduled.length} newly scheduled`);
  }
);

// Weather alert check — every 2 hours
export const weatherAlertCheck = onSchedule(
  { schedule: 'every 2 hours', timeoutSeconds: 120, memory: '256MiB' },
  async () => {
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

    logger.info(`Weather alert check: ${checkedAreas.size} areas, ${alertsTriggered} alerts`);
  }
);

// Certification expiry — daily at 6 AM IST (00:30 UTC)
export const certificationExpiry = onSchedule(
  { schedule: 'every day 06:00', timeZone: 'Asia/Kolkata', timeoutSeconds: 120, memory: '256MiB' },
  async () => {
    const certService = new CertificationService();
    const expiringSoon = await certService.checkExpiringCerts();
    logger.info(`Certification expiry check: ${expiringSoon.length} expiring soon`);
  }
);
