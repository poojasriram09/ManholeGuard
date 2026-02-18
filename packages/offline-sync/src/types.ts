export interface SyncAction {
  id?: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
  priority: number; // Lower = higher priority. SOS = 0, entry = 1, checkin = 2, etc.
}

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

export interface ConflictResolution {
  action: 'server_wins' | 'client_wins' | 'merge';
  mergedPayload?: Record<string, unknown>;
}
