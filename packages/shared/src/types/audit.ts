export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGOUT'
  | 'SCAN' | 'ENTRY_START' | 'ENTRY_EXIT'
  | 'ALERT_TRIGGERED' | 'ALERT_ACKNOWLEDGED'
  | 'SOS_ACTIVATED' | 'CHECKIN_RESPONSE' | 'CHECKIN_MISSED'
  | 'REPORT_GENERATED' | 'SETTING_CHANGED';

export interface AuditLog {
  id: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  hashChain?: string;
  timestamp: Date;
}
