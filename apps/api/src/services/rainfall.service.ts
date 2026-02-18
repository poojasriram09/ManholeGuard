import { env } from '../config/env';
import { logger } from '../utils/logger';

const cache = new Map<string, { data: number; expiresAt: number }>();

export class RainfallService {
  async getRainfallFactor(lat: number, lng: number): Promise<number> {
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    try {
      const url = `${env.OPENMETEO_BASE_URL}?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&timezone=auto&forecast_days=1`;
      const response = await fetch(url);
      const data: any = await response.json();
      const precipitation = data.daily?.precipitation_sum?.[0] || 0;

      // 0mm = 0, 10mm = 50, 30mm+ = 100
      const factor = Math.min(100, (precipitation / 30) * 100);
      cache.set(key, { data: factor, expiresAt: Date.now() + 30 * 60 * 1000 });
      return factor;
    } catch (e) {
      logger.error('Rainfall API error:', e);
      return 0;
    }
  }
}
