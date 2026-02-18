export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  photoUrl?: string;
  mandatory: boolean;
}

export interface Checklist {
  id: string;
  entryLogId: string;
  items: ChecklistItem[];
  allPassed: boolean;
  supervisorApproved: boolean;
  completedAt?: Date;
  createdAt: Date;
}
