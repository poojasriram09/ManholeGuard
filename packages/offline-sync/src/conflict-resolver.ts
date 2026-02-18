import type { SyncAction, ConflictResolution } from './types';

export class ConflictResolver {
  resolve(clientAction: SyncAction, serverData: unknown): ConflictResolution {
    // SOS always wins — client takes priority
    if (clientAction.action === 'sos') {
      return { action: 'client_wins' };
    }

    // Entry exit — client wins (local timestamp more accurate)
    if (clientAction.action === 'entry_exit') {
      return { action: 'client_wins' };
    }

    // Check-in — client wins (response happened locally)
    if (clientAction.action === 'checkin') {
      return { action: 'client_wins' };
    }

    // For other actions, server wins by default
    return { action: 'server_wins' };
  }
}
