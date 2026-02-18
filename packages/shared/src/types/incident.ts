export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
  id: string;
  manholeId: string;
  workerId?: string;
  entryLogId?: string;
  incidentType: string;
  description?: string;
  severity: IncidentSeverity;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  timestamp: Date;
  createdAt: Date;
}
