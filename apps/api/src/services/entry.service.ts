import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { EntryStateMachine } from '../utils/state-machine';
import { RiskEngineService } from './risk-engine.service';
import { logger } from '../utils/logger';

export class EntryService {
  private riskEngine = new RiskEngineService();

  async startEntry(data: {
    workerId: string; manholeId: string; taskId?: string;
    latitude?: number; longitude?: number; geoVerified?: boolean;
  }) {
    const clearance = await this.riskEngine.canWorkerEnter(data.manholeId, data.workerId);
    if (!clearance.allowed) {
      throw new AppError(403, clearance.reason || 'ENTRY_DENIED', `Entry denied: ${clearance.reason}`);
    }

    // Check for active shift
    const activeShift = await prisma.shift.findFirst({
      where: { workerId: data.workerId, status: 'ACTIVE' },
    });

    // Check for team entry
    const activeTeamEntries = await prisma.entryLog.findMany({
      where: { manholeId: data.manholeId, status: 'ACTIVE' },
    });
    const teamEntryId = activeTeamEntries.length > 0 ? activeTeamEntries[0].teamEntryId || activeTeamEntries[0].id : undefined;

    const entry = await prisma.entryLog.create({
      data: {
        workerId: data.workerId,
        manholeId: data.manholeId,
        taskId: data.taskId,
        shiftId: activeShift?.id,
        geoLatitude: data.latitude,
        geoLongitude: data.longitude,
        geoVerified: data.geoVerified ?? false,
        state: 'ENTERED',
        status: 'ACTIVE',
        teamEntryId,
        allowedDurationMinutes: clearance.risk?.riskLevel === 'CAUTION' ? 30 : 45,
      },
      include: { worker: true, manhole: true },
    });

    // Update shift entry count
    if (activeShift) {
      await prisma.shift.update({
        where: { id: activeShift.id },
        data: { entryCount: { increment: 1 } },
      });
    }

    logger.info(`Entry started: worker=${data.workerId} manhole=${data.manholeId}`);
    return entry;
  }

  async confirmExit(entryLogId: string) {
    const entry = await prisma.entryLog.findUnique({ where: { id: entryLogId } });
    if (!entry) throw new AppError(404, 'ENTRY_NOT_FOUND', 'Entry log not found');
    if (entry.status !== 'ACTIVE') throw new AppError(400, 'ENTRY_NOT_ACTIVE', 'Entry is not active');

    const exitTime = new Date();
    const durationMinutes = Math.round((exitTime.getTime() - entry.entryTime.getTime()) / 60000);

    const updated = await prisma.entryLog.update({
      where: { id: entryLogId },
      data: { exitTime, status: 'EXITED', state: 'EXITED' },
      include: { worker: true, manhole: true },
    });

    // Update shift underground time
    if (entry.shiftId) {
      await prisma.shift.update({
        where: { id: entry.shiftId },
        data: { totalUndergroundMinutes: { increment: durationMinutes } },
      });
    }

    logger.info(`Entry exited: id=${entryLogId} duration=${durationMinutes}min`);
    return updated;
  }

  async getActiveEntries() {
    return prisma.entryLog.findMany({
      where: { status: 'ACTIVE' },
      include: {
        worker: { select: { name: true, phone: true, employeeId: true } },
        manhole: { select: { qrCodeId: true, area: true, latitude: true, longitude: true } },
      },
      orderBy: { entryTime: 'asc' },
    });
  }

  async getById(id: string) {
    const entry = await prisma.entryLog.findUnique({
      where: { id },
      include: {
        worker: true,
        manhole: true,
        checklist: true,
        checkIns: { orderBy: { promptedAt: 'desc' } },
        healthCheck: true,
      },
    });
    if (!entry) throw new AppError(404, 'ENTRY_NOT_FOUND', 'Entry log not found');
    return entry;
  }

  async getByWorkerId(workerId: string, limit: number = 20) {
    return prisma.entryLog.findMany({
      where: { workerId },
      include: { manhole: { select: { area: true, qrCodeId: true } } },
      orderBy: { entryTime: 'desc' },
      take: limit,
    });
  }
}
