import { logger } from '../utils/logger';

const cache = new Map<string, { data: any; expiresAt: number }>();

export class NearestFacilityService {
  async findNearest(lat: number, lng: number, type: 'hospital' | 'fire_station'): Promise<{ name: string; distanceKm: number } | null> {
    const key = `facility:${type}:${lat.toFixed(3)},${lng.toFixed(3)}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    try {
      const amenity = type === 'hospital' ? 'hospital' : 'fire_station';
      const query = `[out:json][timeout:10];node["amenity"="${amenity}"](around:10000,${lat},${lng});out 1;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      const data: any = await response.json();

      if (data.elements?.length > 0) {
        const el = data.elements[0];
        const name = el.tags?.name || `Nearest ${type.replace('_', ' ')}`;
        const distanceKm = this.haversineKm(lat, lng, el.lat, el.lon);
        const result = { name, distanceKm: Math.round(distanceKm * 10) / 10 };
        cache.set(key, { data: result, expiresAt: Date.now() + 24 * 3600000 });
        return result;
      }
      return null;
    } catch (e) {
      logger.error(`Failed to find nearest ${type}:`, e);
      return null;
    }
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
