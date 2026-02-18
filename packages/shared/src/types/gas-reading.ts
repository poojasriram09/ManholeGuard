export interface GasReading {
  id: string;
  manholeId: string;
  h2s: number;
  ch4: number;
  co: number;
  o2: number;
  co2: number;
  nh3: number;
  temperature?: number;
  humidity?: number;
  isDangerous: boolean;
  alertTriggered: boolean;
  source: 'sensor' | 'manual';
  readAt: Date;
}
