export type GrievanceStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type GrievanceIssueType = 'open_manhole' | 'overflow' | 'foul_smell' | 'blockage' | 'structural_damage';

export interface Grievance {
  id: string;
  manholeId?: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  issueType: GrievanceIssueType;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  photoUrls: string[];
  status: GrievanceStatus;
  trackingCode: string;
  assignedTo?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
