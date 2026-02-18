export interface Manhole {
  id: string;
  qrCodeId: string;
  latitude: number;
  longitude: number;
  area: string;
  address?: string;
  depth?: number;
  diameter?: number;
  maxWorkers: number;
  riskLevel: RiskLevel;
  riskScore: number;
  geoFenceRadius: number;
  lastCleanedAt?: Date;
  nextMaintenanceAt?: Date;
  hasGasSensor: boolean;
  sensorDeviceId?: string;
  nearestHospital?: string;
  nearestHospitalDist?: number;
  nearestFireStation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RiskLevel = 'SAFE' | 'CAUTION' | 'PROHIBITED';
