export interface GasThreshold {
  warning: number;
  danger: number;
  unit: string;
  name: string;
}

export interface OxygenThreshold {
  low: number;
  high: number;
  unit: string;
  name: string;
}

export const GAS_THRESHOLDS: Record<string, GasThreshold> = {
  h2s: { warning: 10, danger: 20, unit: 'ppm', name: 'Hydrogen Sulfide' },
  ch4: { warning: 1000, danger: 5000, unit: 'ppm', name: 'Methane' },
  co: { warning: 35, danger: 100, unit: 'ppm', name: 'Carbon Monoxide' },
  co2: { warning: 5000, danger: 40000, unit: 'ppm', name: 'Carbon Dioxide' },
  nh3: { warning: 25, danger: 50, unit: 'ppm', name: 'Ammonia' },
};

export const OXYGEN_THRESHOLD: OxygenThreshold = {
  low: 19.5,
  high: 23.5,
  unit: '%',
  name: 'Oxygen',
};
