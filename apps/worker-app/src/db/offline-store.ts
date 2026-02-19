import { db, addToSyncQueue } from './dexie';

export interface CachedSession {
  entryId: string;
  workerId: string;
  manholeId: string;
  entryTime: string;
  allowedDurationMinutes: number;
  manholeArea: string;
  manholeQrCode: string;
}

export interface PendingSOS {
  workerId: string;
  latitude?: number;
  longitude?: number;
  method: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  ACTIVE_SESSION: 'mg_active_session',
  PENDING_SOS: 'mg_pending_sos',
  CHECKLIST_TEMPLATES: 'mg_checklist_templates',
  LAST_GPS: 'mg_last_gps',
  WORKER_PROFILE: 'mg_worker_profile',
  LANGUAGE: 'mg_language',
};

export const offlineStore = {
  // Active session cache
  saveActiveSession(session: CachedSession) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  },

  getActiveSession(): CachedSession | null {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return data ? JSON.parse(data) : null;
  },

  clearActiveSession() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  },

  // Pending SOS (highest priority offline action)
  async savePendingSOS(sos: PendingSOS) {
    localStorage.setItem(STORAGE_KEYS.PENDING_SOS, JSON.stringify(sos));
    await addToSyncQueue('SOS_TRIGGER', sos as any);
  },

  getPendingSOS(): PendingSOS | null {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_SOS);
    return data ? JSON.parse(data) : null;
  },

  clearPendingSOS() {
    localStorage.removeItem(STORAGE_KEYS.PENDING_SOS);
  },

  // Checklist templates for offline use
  saveChecklistTemplates(templates: Record<string, unknown>[]) {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_TEMPLATES, JSON.stringify(templates));
  },

  getChecklistTemplates(): Record<string, unknown>[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHECKLIST_TEMPLATES);
    return data ? JSON.parse(data) : [];
  },

  // Last known GPS position
  saveLastGPS(position: { latitude: number; longitude: number; timestamp: number }) {
    localStorage.setItem(STORAGE_KEYS.LAST_GPS, JSON.stringify(position));
  },

  getLastGPS(): { latitude: number; longitude: number; timestamp: number } | null {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_GPS);
    return data ? JSON.parse(data) : null;
  },

  // Worker profile cache
  saveWorkerProfile(profile: Record<string, unknown>) {
    localStorage.setItem(STORAGE_KEYS.WORKER_PROFILE, JSON.stringify(profile));
  },

  getWorkerProfile(): Record<string, unknown> | null {
    const data = localStorage.getItem(STORAGE_KEYS.WORKER_PROFILE);
    return data ? JSON.parse(data) : null;
  },

  // Language preference
  saveLanguage(lang: string) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  getLanguage(): string {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  },

  // Queue a check-in response for offline sync
  async queueCheckInResponse(checkInId: string, method: string) {
    await addToSyncQueue('CHECKIN_RESPOND', { checkInId, method, respondedAt: new Date().toISOString() });
  },

  // Queue an exit action for offline sync
  async queueExitAction(entryId: string) {
    await addToSyncQueue('ENTRY_EXIT', { entryId, exitTime: new Date().toISOString() });
  },

  // Get pending sync count
  async getPendingSyncCount(): Promise<number> {
    return db.syncQueue.where('synced').equals(0).count();
  },
};
