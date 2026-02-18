export const RISK_LEVELS = {
  SAFE: { label: 'Safe', maxScore: 30, color: '#22c55e' },
  CAUTION: { label: 'Caution', maxScore: 60, color: '#f59e0b' },
  PROHIBITED: { label: 'Prohibited', maxScore: 100, color: '#ef4444' },
} as const;

export const RISK_WEIGHTS = {
  blockageFrequency: 0.25,
  incidentCount: 0.20,
  rainfallFactor: 0.15,
  areaRisk: 0.10,
  gasFactor: 0.20,
  weatherFactor: 0.10,
} as const;
