import prisma from '../config/database';
import { env } from '../config/env';

export class FatigueService {
  async canWorkerEnter(workerId: string): Promise<{ allowed: boolean; reason?: string }> {
    const shift = await prisma.shift.findFirst({
      where: { workerId, status: 'ACTIVE' },
    });

    if (!shift) return { allowed: true };

    if (shift.entryCount >= env.MAX_ENTRIES_PER_SHIFT) {
      return { allowed: false, reason: 'MAX_ENTRIES_REACHED' };
    }

    if (shift.totalUndergroundMinutes >= env.MAX_UNDERGROUND_MINUTES_PER_SHIFT) {
      return { allowed: false, reason: 'MAX_UNDERGROUND_TIME_REACHED' };
    }

    // Check rest between entries
    const lastEntry = await prisma.entryLog.findFirst({
      where: { workerId, status: 'EXITED' },
      orderBy: { exitTime: 'desc' },
    });

    if (lastEntry?.exitTime) {
      const restMinutes = (Date.now() - lastEntry.exitTime.getTime()) / 60000;
      if (restMinutes < env.MIN_REST_BETWEEN_ENTRIES_MINUTES) {
        return { allowed: false, reason: 'REST_REQUIRED' };
      }
    }

    const shiftHours = (Date.now() - shift.startTime.getTime()) / 3600000;
    if (shiftHours >= env.MAX_SHIFT_HOURS) {
      return { allowed: false, reason: 'SHIFT_EXCEEDED' };
    }

    return { allowed: true };
  }

  calculateFatigueScore(shift: { entryCount: number; totalUndergroundMinutes: number; startTime: Date }): number {
    const entryFactor = (shift.entryCount / env.MAX_ENTRIES_PER_SHIFT) * 30;
    const timeFactor = (shift.totalUndergroundMinutes / env.MAX_UNDERGROUND_MINUTES_PER_SHIFT) * 40;
    const shiftHours = (Date.now() - shift.startTime.getTime()) / 3600000;
    const hoursFactor = (shiftHours / env.MAX_SHIFT_HOURS) * 30;

    return Math.min(100, Math.round(entryFactor + timeFactor + hoursFactor));
  }
}
