export type EntryStatus = 'ACTIVE' | 'EXITED' | 'OVERSTAY_ALERT';

export type EntryState =
  | 'IDLE'
  | 'SCANNED'
  | 'CHECKLIST_PENDING'
  | 'ENTERED'
  | 'ACTIVE'
  | 'EXITED'
  | 'OVERSTAY_ALERT'
  | 'SOS_TRIGGERED'
  | 'GAS_ALERT'
  | 'CHECKIN_MISSED';

export interface EntryLog {
  id: string;
  workerId: string;
  manholeId: string;
  taskId?: string;
  shiftId?: string;
  entryTime: Date;
  exitTime?: Date;
  allowedDurationMinutes: number;
  status: EntryStatus;
  state: EntryState;
  geoLatitude?: number;
  geoLongitude?: number;
  geoVerified: boolean;
  checklistCompleted: boolean;
  teamEntryId?: string;
  isOfflineEntry: boolean;
  syncedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
