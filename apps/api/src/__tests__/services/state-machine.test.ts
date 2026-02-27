import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@manholeguard/shared/src/constants/state-machine', () => ({
  STATE_TRANSITIONS: {
    IDLE: { SCAN_QR: 'SCANNED' },
    SCANNED: { COMPLETE_CHECKLIST: 'CHECKLIST_PENDING', RESET: 'IDLE' },
    CHECKLIST_PENDING: { CONFIRM_ENTRY: 'ENTERED', RESET: 'IDLE' },
    ENTERED: { ACTIVATE: 'ACTIVE', CONFIRM_EXIT: 'EXITED', RESET: 'IDLE' },
    ACTIVE: {
      CONFIRM_EXIT: 'EXITED',
      TRIGGER_ALERT: 'OVERSTAY_ALERT',
      GAS_DANGER: 'GAS_ALERT',
      MISS_CHECKIN: 'CHECKIN_MISSED',
      TRIGGER_SOS: 'SOS_TRIGGERED',
    },
    EXITED: { RESET: 'IDLE' },
    OVERSTAY_ALERT: { CONFIRM_EXIT: 'EXITED', TRIGGER_SOS: 'SOS_TRIGGERED' },
    SOS_TRIGGERED: { CANCEL_SOS: 'ACTIVE', CONFIRM_EXIT: 'EXITED' },
    GAS_ALERT: { CONFIRM_EXIT: 'EXITED', RESOLVE_GAS: 'ACTIVE', TRIGGER_SOS: 'SOS_TRIGGERED' },
    CHECKIN_MISSED: { RESOLVE_CHECKIN: 'ACTIVE', TRIGGER_SOS: 'SOS_TRIGGERED', CONFIRM_EXIT: 'EXITED' },
  },
}));

import { EntryStateMachine } from '../../utils/state-machine';

describe('EntryStateMachine', () => {
  let sm: EntryStateMachine;

  beforeEach(() => {
    vi.clearAllMocks();
    sm = new EntryStateMachine();
  });

  describe('initial state', () => {
    it('should default to IDLE', () => {
      expect(sm.getState()).toBe('IDLE');
    });

    it('should accept a custom initial state', () => {
      const custom = new EntryStateMachine('ACTIVE');
      expect(custom.getState()).toBe('ACTIVE');
    });
  });

  describe('happy-path loop', () => {
    it('should traverse IDLE → SCANNED → CHECKLIST_PENDING → ENTERED → ACTIVE → EXITED → IDLE', () => {
      expect(sm.transition('SCAN_QR')).toBe('SCANNED');
      expect(sm.transition('COMPLETE_CHECKLIST')).toBe('CHECKLIST_PENDING');
      expect(sm.transition('CONFIRM_ENTRY')).toBe('ENTERED');
      expect(sm.transition('ACTIVATE')).toBe('ACTIVE');
      expect(sm.transition('CONFIRM_EXIT')).toBe('EXITED');
      expect(sm.transition('RESET')).toBe('IDLE');
      expect(sm.getState()).toBe('IDLE');
    });
  });

  describe('alert transitions from ACTIVE', () => {
    beforeEach(() => {
      sm = new EntryStateMachine('ACTIVE');
    });

    it('TRIGGER_ALERT → OVERSTAY_ALERT', () => {
      expect(sm.transition('TRIGGER_ALERT')).toBe('OVERSTAY_ALERT');
    });

    it('GAS_DANGER → GAS_ALERT', () => {
      expect(sm.transition('GAS_DANGER')).toBe('GAS_ALERT');
    });

    it('MISS_CHECKIN → CHECKIN_MISSED', () => {
      expect(sm.transition('MISS_CHECKIN')).toBe('CHECKIN_MISSED');
    });

    it('TRIGGER_SOS → SOS_TRIGGERED', () => {
      expect(sm.transition('TRIGGER_SOS')).toBe('SOS_TRIGGERED');
    });

    it('CONFIRM_EXIT → EXITED', () => {
      expect(sm.transition('CONFIRM_EXIT')).toBe('EXITED');
    });
  });

  describe('SOS from all alert states', () => {
    it('OVERSTAY_ALERT → SOS_TRIGGERED', () => {
      sm = new EntryStateMachine('OVERSTAY_ALERT');
      expect(sm.transition('TRIGGER_SOS')).toBe('SOS_TRIGGERED');
    });

    it('GAS_ALERT → SOS_TRIGGERED', () => {
      sm = new EntryStateMachine('GAS_ALERT');
      expect(sm.transition('TRIGGER_SOS')).toBe('SOS_TRIGGERED');
    });

    it('CHECKIN_MISSED → SOS_TRIGGERED', () => {
      sm = new EntryStateMachine('CHECKIN_MISSED');
      expect(sm.transition('TRIGGER_SOS')).toBe('SOS_TRIGGERED');
    });
  });

  describe('recovery paths', () => {
    it('RESOLVE_GAS from GAS_ALERT → ACTIVE', () => {
      sm = new EntryStateMachine('GAS_ALERT');
      expect(sm.transition('RESOLVE_GAS')).toBe('ACTIVE');
    });

    it('RESOLVE_CHECKIN from CHECKIN_MISSED → ACTIVE', () => {
      sm = new EntryStateMachine('CHECKIN_MISSED');
      expect(sm.transition('RESOLVE_CHECKIN')).toBe('ACTIVE');
    });

    it('CANCEL_SOS from SOS_TRIGGERED → ACTIVE', () => {
      sm = new EntryStateMachine('SOS_TRIGGERED');
      expect(sm.transition('CANCEL_SOS')).toBe('ACTIVE');
    });
  });

  describe('exit from alert states', () => {
    it('CONFIRM_EXIT from OVERSTAY_ALERT → EXITED', () => {
      sm = new EntryStateMachine('OVERSTAY_ALERT');
      expect(sm.transition('CONFIRM_EXIT')).toBe('EXITED');
    });

    it('CONFIRM_EXIT from GAS_ALERT → EXITED', () => {
      sm = new EntryStateMachine('GAS_ALERT');
      expect(sm.transition('CONFIRM_EXIT')).toBe('EXITED');
    });

    it('CONFIRM_EXIT from CHECKIN_MISSED → EXITED', () => {
      sm = new EntryStateMachine('CHECKIN_MISSED');
      expect(sm.transition('CONFIRM_EXIT')).toBe('EXITED');
    });

    it('CONFIRM_EXIT from SOS_TRIGGERED → EXITED', () => {
      sm = new EntryStateMachine('SOS_TRIGGERED');
      expect(sm.transition('CONFIRM_EXIT')).toBe('EXITED');
    });
  });

  describe('invalid transitions', () => {
    it('should throw on invalid event from IDLE', () => {
      expect(() => sm.transition('CONFIRM_EXIT' as any)).toThrow('Invalid transition: IDLE + CONFIRM_EXIT');
    });

    it('should throw on ACTIVATE from IDLE', () => {
      expect(() => sm.transition('ACTIVATE' as any)).toThrow('Invalid transition: IDLE + ACTIVATE');
    });

    it('should throw on SCAN_QR from ACTIVE', () => {
      sm = new EntryStateMachine('ACTIVE');
      expect(() => sm.transition('SCAN_QR' as any)).toThrow('Invalid transition: ACTIVE + SCAN_QR');
    });

    it('should throw on RESET from ACTIVE (no RESET event defined)', () => {
      sm = new EntryStateMachine('ACTIVE');
      expect(() => sm.transition('RESET' as any)).toThrow('Invalid transition: ACTIVE + RESET');
    });
  });

  describe('canTransition', () => {
    it('should return true for valid events', () => {
      expect(sm.canTransition('SCAN_QR')).toBe(true);
    });

    it('should return false for invalid events', () => {
      expect(sm.canTransition('CONFIRM_EXIT')).toBe(false);
    });
  });

  describe('RESET from early states', () => {
    it('SCANNED → IDLE via RESET', () => {
      sm = new EntryStateMachine('SCANNED');
      expect(sm.transition('RESET')).toBe('IDLE');
    });

    it('CHECKLIST_PENDING → IDLE via RESET', () => {
      sm = new EntryStateMachine('CHECKLIST_PENDING');
      expect(sm.transition('RESET')).toBe('IDLE');
    });

    it('ENTERED → IDLE via RESET', () => {
      sm = new EntryStateMachine('ENTERED');
      expect(sm.transition('RESET')).toBe('IDLE');
    });

    it('EXITED → IDLE via RESET', () => {
      sm = new EntryStateMachine('EXITED');
      expect(sm.transition('RESET')).toBe('IDLE');
    });
  });
});
