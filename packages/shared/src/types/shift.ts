export type ShiftStatus = 'ACTIVE' | 'COMPLETED' | 'EXCEEDED_LIMIT';

export interface Shift {
  id: string;
  workerId: string;
  startTime: Date;
  endTime?: Date;
  status: ShiftStatus;
  entryCount: number;
  totalUndergroundMinutes: number;
  breaksTaken: number;
  fatigueScore: number;
  notes?: string;
}

export interface ShiftSummary {
  shift: Shift;
  limits: {
    maxEntries: number;
    maxUndergroundMinutes: number;
    minRestMinutes: number;
    maxShiftHours: number;
  };
  remaining: {
    entries: number;
    undergroundMinutes: number;
    shiftHours: number;
  };
}
