export type CertificationType =
  | 'SAFETY_TRAINING'
  | 'CONFINED_SPACE'
  | 'FIRST_AID'
  | 'GAS_DETECTION'
  | 'PPE_USAGE'
  | 'MEDICAL_FITNESS';

export interface WorkerCertification {
  id: string;
  workerId: string;
  type: CertificationType;
  certificateNumber?: string;
  issuedAt: Date;
  expiresAt: Date;
  issuedBy?: string;
  documentUrl?: string;
  isValid: boolean;
  createdAt: Date;
}
