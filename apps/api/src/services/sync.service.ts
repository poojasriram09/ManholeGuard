import prisma from '../config/database';

export class SyncService {
  async pushActions(deviceId: string, actions: Array<{ action: string; payload: Record<string, unknown>; createdAt: string }>) {
    const records = [];

    for (const a of actions) {
      const record = await prisma.syncQueue.create({
        data: {
          deviceId,
          action: a.action,
          payload: a.payload,
          createdAt: new Date(a.createdAt),
        },
      });
      records.push(record);
    }

    return records;
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
