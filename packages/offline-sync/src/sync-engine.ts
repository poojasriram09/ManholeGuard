import type { SyncAction, SyncResult } from './types';
import { ConflictResolver } from './conflict-resolver';

export class SyncEngine {
  private apiUrl: string;
  private getToken: () => string | null;
  private resolver = new ConflictResolver();

  constructor(apiUrl: string, getToken: () => string | null) {
    this.apiUrl = apiUrl;
    this.getToken = getToken;
  }

  async syncActions(actions: SyncAction[]): Promise<SyncResult> {
    // Sort by priority (SOS first)
    const sorted = [...actions].sort((a, b) => a.priority - b.priority);

    const result: SyncResult = { synced: 0, failed: 0, conflicts: 0, errors: [] };

    for (const action of sorted) {
      try {
        const response = await fetch(`${this.apiUrl}/sync/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.getToken() && { Authorization: `Bearer ${this.getToken()}` }),
          },
          body: JSON.stringify({ deviceId: this.getDeviceId(), actions: [action] }),
        });

        if (response.ok) {
          result.synced++;
        } else {
          const data: any = await response.json();
          if (response.status === 409) {
            result.conflicts++;
            // Attempt conflict resolution
            const resolution = this.resolver.resolve(action, data.serverData);
            if (resolution.action !== 'server_wins') {
              // Retry with merged data
              action.payload = resolution.mergedPayload || action.payload;
            }
          } else {
            result.failed++;
            result.errors.push(data.error?.message || 'Unknown error');
          }
        }
      } catch (e) {
        result.failed++;
        result.errors.push(e instanceof Error ? e.message : 'Network error');
      }
    }

    return result;
  }

  private getDeviceId(): string {
    if (typeof localStorage !== 'undefined') {
      let id = localStorage.getItem('device-id');
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('device-id', id);
      }
      return id;
    }
    return 'unknown';
  }

  static getPriority(action: string): number {
    const priorities: Record<string, number> = {
      sos: 0,
      entry_exit: 1,
      entry_start: 2,
      checkin: 3,
      health_check: 4,
      gas_reading: 5,
    };
    return priorities[action] ?? 10;
  }
}
