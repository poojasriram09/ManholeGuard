export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RiskPrediction {
  manholeId: string;
  riskScore: number;
  riskLevel: 'SAFE' | 'CAUTION' | 'PROHIBITED';
  factors: {
    blockageFrequency: number;
    incidentCount: number;
    rainfallFactor: number;
    areaRisk: number;
    gasFactor: number;
    weatherFactor: number;
  };
  calculatedAt: Date;
}

export interface EntryClearance {
  allowed: boolean;
  reason?: string;
  risk?: RiskPrediction;
  checks?: {
    riskLevel: { passed: boolean; value: string };
    certifications: { passed: boolean; expired?: string[] };
    fatigue: { passed: boolean; reason?: string };
    gasLevels: { passed: boolean; dangerous?: string[] };
    weather: { passed: boolean; alerts?: string[] };
    capacity: { passed: boolean; current?: number; max?: number };
  };
}

export interface GeoVerification {
  verified: boolean;
  distance: number;
  radius: number;
  message: string;
}

export interface SOSRecord {
  id: string;
  entryLogId?: string;
  workerId: string;
  latitude?: number;
  longitude?: number;
  triggerMethod: string;
  nearestHospital?: string;
  hospitalDistance?: number;
  nearestFireStation?: string;
  respondedAt?: Date;
  resolvedAt?: Date;
  outcome?: string;
  createdAt: Date;
}

export interface HealthTrend {
  totalChecks: number;
  symptomaticCount: number;
  symptomFrequency: Record<string, number>;
  needsAttention: boolean;
}
