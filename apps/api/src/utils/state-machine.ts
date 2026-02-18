import { STATE_TRANSITIONS } from '@manholeguard/shared/src/constants/state-machine';
import type { EntryState } from '@manholeguard/shared';

type EntryEvent =
  | 'SCAN_QR' | 'COMPLETE_CHECKLIST' | 'CONFIRM_ENTRY' | 'ACTIVATE'
  | 'CONFIRM_EXIT' | 'TRIGGER_ALERT' | 'TRIGGER_SOS' | 'GAS_DANGER'
  | 'MISS_CHECKIN' | 'RESOLVE_CHECKIN' | 'RESOLVE_GAS' | 'CANCEL_SOS' | 'RESET';

export class EntryStateMachine {
  private state: EntryState;

  constructor(initialState: EntryState = 'IDLE') {
    this.state = initialState;
  }

  getState(): EntryState {
    return this.state;
  }

  canTransition(event: EntryEvent): boolean {
    const transitions = STATE_TRANSITIONS[this.state];
    return event in transitions;
  }

  transition(event: EntryEvent): EntryState {
    const transitions = STATE_TRANSITIONS[this.state];
    const nextState = transitions[event];
    if (!nextState) {
      throw new Error(`Invalid transition: ${this.state} + ${event}`);
    }
    this.state = nextState;
    return this.state;
  }
}
