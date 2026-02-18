import Dexie, { type Table } from 'dexie';

interface SyncAction {
  id?: number;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
}

interface CachedManhole {
  qrCodeId: string;
  data: Record<string, unknown>;
  cachedAt: string;
}

class ManholeGuardDB extends Dexie {
  syncQueue!: Table<SyncAction>;
  cachedManholes!: Table<CachedManhole>;

  constructor() {
    super('ManholeguardWorker');
    this.version(1).stores({
      syncQueue: '++id, action, synced',
      cachedManholes: 'qrCodeId',
    });
  }
}

export const db = new ManholeGuardDB();

export async function addToSyncQueue(action: string, payload: Record<string, unknown>) {
  await db.syncQueue.add({ action, payload, createdAt: new Date().toISOString(), synced: false });
}

export async function getPendingSync() {
  return db.syncQueue.where('synced').equals(0).toArray();
}

export async function markSynced(ids: number[]) {
  await db.syncQueue.where('id').anyOf(ids).modify({ synced: true });
}
