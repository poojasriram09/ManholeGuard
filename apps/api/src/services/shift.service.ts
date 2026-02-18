import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { FatigueService } from './fatigue.service';

export class ShiftService {
  private fatigueService = new FatigueService();

  async startShift(workerId: string) {
    const existing = await prisma.shift.findFirst({
      where: { workerId, status: 'ACTIVE' },
    });
    if (existing) throw new AppError(400, 'SHIFT_ACTIVE', 'Worker already has an active shift');

    return prisma.shift.create({
      data: { workerId, startTime: new Date() },
    });
  }

  async endShift(shiftId: string) {
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) throw new AppError(404, 'SHIFT_NOT_FOUND', 'Shift not found');

    const fatigueScore = this.fatigueService.calculateFatigueScore(shift);

    return prisma.shift.update({
      where: { id: shiftId },
      data: { endTime: new Date(), status: 'COMPLETED', fatigueScore },
    });
  }

  async getActiveShift(workerId: string) {
    return prisma.shift.findFirst({
      where: { workerId, status: 'ACTIVE' },
      include: { entryLogs: { select: { id: true, status: true, entryTime: true, exitTime: true } } },
    });
  }

  async getFatigueStatus(workerId: string) {
    const shift = await this.getActiveShift(workerId);
    if (!shift) return { hasActiveShift: false };

    const fatigueScore = this.fatigueService.calculateFatigueScore(shift);
    const canEnter = await this.fatigueService.canWorkerEnter(workerId);

    return {
      hasActiveShift: true,
      shift,
      fatigueScore,
      canEnter: canEnter.allowed,
      reason: canEnter.reason,
    };
  }
}
