import { useState, useEffect, useCallback } from 'react';
import { getPendingSync, markSynced } from '../db/dexie';
import { apiRequest } from '../api/client';

const SYNC_PRIORITY: Record<string, number> = {
  SOS_TRIGGER: 0,
  ENTRY_EXIT: 1,
  CHECKIN_RESPOND: 2,
  HEALTH_CHECK: 3,
};

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPendingCount = useCallback(async () => {
    const pending = await getPendingSync();
    setPendingCount(pending.length);
  }, []);

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 5000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  const syncAll = useCallback(async () => {
    if (!navigator.onLine || syncing) return;

    setSyncing(true);
    try {
      const pending = await getPendingSync();
      if (pending.length === 0) return;

      // Sort by priority (SOS first)
      const sorted = [...pending].sort((a, b) => {
        const pa = SYNC_PRIORITY[a.action] ?? 99;
        const pb = SYNC_PRIORITY[b.action] ?? 99;
        return pa - pb;
      });

      const syncedIds: number[] = [];

      for (const action of sorted) {
        try {
          await apiRequest('/sync/push', {
            method: 'POST',
            body: JSON.stringify({
              deviceId: getDeviceId(),
              actions: [{ action: action.action, payload: action.payload, createdAt: action.createdAt }],
            }),
          });
          if (action.id) syncedIds.push(action.id);
        } catch (error) {
          console.error(`Sync failed for action ${action.action}:`, error);
          // Stop syncing on failure (will retry on next cycle)
          break;
        }
      }

      if (syncedIds.length > 0) {
        await markSynced(syncedIds);
      }

      await refreshPendingCount();
    } finally {
      setSyncing(false);
    }
  }, [syncing, refreshPendingCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncAll();
    }
  }, [isOnline, pendingCount, syncAll]);

  return { isOnline, pendingCount, syncing, syncAll };
}

function getDeviceId(): string {
  let deviceId = localStorage.getItem('mg_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('mg_device_id', deviceId);
  }
  return deviceId;
}
