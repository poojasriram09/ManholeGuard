import prisma from '../config/database';
import { logger } from '../utils/logger';

type SyncPriority = 'SOS_TRIGGER' | 'ENTRY_EXIT' | 'CHECKIN_RESPOND' | 'HEALTH_CHECK' | 'GAS_READING';

const PRIORITY_ORDER: Record<string, number> = {
  SOS_TRIGGER: 0,
  ENTRY_EXIT: 1,
  CHECKIN_RESPOND: 2,
  HEALTH_CHECK: 3,
  GAS_READING: 4,
};

export class SyncService {
  async pushActions(deviceId: string, actions: Array<{ action: string; payload: Record<string, unknown>; createdAt: string }>) {
    // Sort by priority (SOS first)
    const sorted = [...actions].sort((a, b) => {
      const pa = PRIORITY_ORDER[a.action] ?? 99;
      const pb = PRIORITY_ORDER[b.action] ?? 99;
      return pa - pb;
    });

    const records = [];

    for (const a of sorted) {
      const record = await prisma.syncQueue.create({
        data: {
          deviceId,
          action: a.action,
          payload: a.payload,
          createdAt: new Date(a.createdAt),
        },
      });
      records.push(record);

      // Process the action immediately
      await this.processAction(a.action, a.payload);
    }

    return records;
  }

  /** Route offline actions to appropriate services */
  async processAction(action: string, payload: Record<string, unknown>) {
    try {
      switch (action) {
        case 'SOS_TRIGGER': {
          const { SOSService } = await import('./sos.service');
          const sosService = new SOSService();
          await sosService.triggerSOS({
            workerId: payload.workerId as string,
            latitude: payload.latitude as number | undefined,
            longitude: payload.longitude as number | undefined,
            method: (payload.method as string) || 'offline_sync',
          });
          break;
        }
        case 'ENTRY_EXIT': {
          const { EntryService } = await import('./entry.service');
          const entryService = new EntryService();
          await entryService.confirmExit(payload.entryId as string);
          break;
        }
        case 'CHECKIN_RESPOND': {
          const { CheckInService } = await import('./checkin.service');
          const checkInService = new CheckInService();
          await checkInService.respondToCheckIn(
            payload.checkInId as string,
            (payload.method as string) || 'offline_sync'
          );
          break;
        }
        case 'HEALTH_CHECK': {
          const { HealthCheckService } = await import('./health-check.service');
          const healthService = new HealthCheckService();
          await healthService.recordHealthCheck(payload as any);
          break;
        }
        default:
          logger.warn(`Unknown sync action: ${action}`);
      }
    } catch (error) {
      logger.error(`Failed to process sync action ${action}:`, error);
      // Mark the record as having a conflict
      throw error;
    }
  }

  /** Detect conflicts between offline and server data */
  async detectConflict(action: string, payload: Record<string, unknown>): Promise<boolean> {
    switch (action) {
      case 'ENTRY_EXIT': {
        const entry = await prisma.entryLog.findUnique({
          where: { id: payload.entryId as string },
        });
        // Conflict if already exited
        return entry?.status === 'EXITED';
      }
      case 'CHECKIN_RESPOND': {
        const checkIn = await prisma.checkIn.findUnique({
          where: { id: payload.checkInId as string },
        });
        // Conflict if already responded
        return !!checkIn?.respondedAt;
      }
      default:
        return false;
    }
  }

  /** Full sync with priority ordering and conflict detection */
  async fullSync(deviceId: string, actions: Array<{ action: string; payload: Record<string, unknown>; createdAt: string }>) {
    const sorted = [...actions].sort((a, b) => {
      const pa = PRIORITY_ORDER[a.action] ?? 99;
      const pb = PRIORITY_ORDER[b.action] ?? 99;
      return pa - pb;
    });

    const results: Array<{ action: string; status: 'synced' | 'conflict' | 'error'; error?: string }> = [];

    for (const a of sorted) {
      const hasConflict = await this.detectConflict(a.action, a.payload);

      if (hasConflict) {
        results.push({ action: a.action, status: 'conflict' });
        await prisma.syncQueue.create({
          data: { deviceId, action: a.action, payload: a.payload, createdAt: new Date(a.createdAt), syncStatus: 'conflict', conflictData: a.payload },
        });
        continue;
      }

      try {
        await this.processAction(a.action, a.payload);
        await prisma.syncQueue.create({
          data: { deviceId, action: a.action, payload: a.payload, createdAt: new Date(a.createdAt), syncStatus: 'synced', syncedAt: new Date() },
        });
        results.push({ action: a.action, status: 'synced' });
      } catch (error: any) {
        results.push({ action: a.action, status: 'error', error: error.message });
      }
    }

    return results;
  }

  async getPending(deviceId: string) {
    return prisma.syncQueue.findMany({
      where: { deviceId, syncStatus: 'pending' },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markSynced(ids: string[]) {
    return prisma.syncQueue.updateMany({
      where: { id: { in: ids } },
      data: { syncStatus: 'synced', syncedAt: new Date() },
    });
  }
}
