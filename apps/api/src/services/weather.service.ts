import { env } from '../config/env';
import { logger } from '../utils/logger';
import prisma from '../config/database';

const cache = new Map<string, { data: any; expiresAt: number }>();

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation24h: number;
  weatherCode: number;
}

export class WeatherService {
  async fetchWeather(lat: number, lng: number): Promise<WeatherData> {
    const key = `weather:${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    try {
      const url = `${env.OPENMETEO_BASE_URL}?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=precipitation_sum&timezone=auto&forecast_days=1`;
      const response = await fetch(url);
      const data: any = await response.json();

      const weather: WeatherData = {
        temperature: data.current?.temperature_2m || 0,
        humidity: data.current?.relative_humidity_2m || 0,
        windSpeed: data.current?.wind_speed_10m || 0,
        precipitation24h: data.daily?.precipitation_sum?.[0] || 0,
        weatherCode: data.current?.weather_code || 0,
      };

      cache.set(key, { data: weather, expiresAt: Date.now() + 60 * 60 * 1000 });
      return weather;
    } catch (e) {
      logger.error('Weather API error:', e);
      return { temperature: 25, humidity: 50, windSpeed: 10, precipitation24h: 0, weatherCode: 0 };
    }
  }

  async getWeatherFactor(lat: number, lng: number): Promise<number> {
    const weather = await this.fetchWeather(lat, lng);
    let factor = 0;

    if (weather.weatherCode >= 95) factor = Math.max(factor, 100); // Thunderstorm
    if (weather.precipitation24h > 30) factor = Math.max(factor, 90); // Heavy rain
    if (weather.temperature > 45) factor = Math.max(factor, 100); // Extreme heat
    else if (weather.temperature > 42) factor = Math.max(factor, 60);
    if (weather.windSpeed > 60) factor = Math.max(factor, 60);
    if (weather.humidity > 95 && weather.temperature > 35) factor = Math.max(factor, 50);

    return factor;
  }

  async isSafeToWork(manholeId: string): Promise<boolean> {
    const manhole = await prisma.manhole.findUnique({ where: { id: manholeId } });
    if (!manhole) return true;

    const weather = await this.fetchWeather(manhole.latitude, manhole.longitude);
    if (weather.weatherCode >= 95) return false;
    if (weather.temperature > 45) return false;
    if (weather.precipitation24h > 30) return false;
    return true;
  }

  async checkWeatherAlerts() {
    const areas = await prisma.manhole.findMany({
      distinct: ['area'],
      select: { area: true, latitude: true, longitude: true },
    });

    const alerts: Array<{ area: string; type: string; severity: string; message: string }> = [];

    for (const area of areas) {
      const weather = await this.fetchWeather(area.latitude, area.longitude);

      if (weather.weatherCode >= 95) {
        alerts.push({ area: area.area, type: 'THUNDERSTORM', severity: 'HIGH', message: 'Thunderstorm warning. All outdoor operations should be suspended.' });
      }
      if (weather.precipitation24h > 30) {
        alerts.push({ area: area.area, type: 'FLOOD_RISK', severity: 'HIGH', message: 'Heavy rainfall expected. Manholes may flood. Avoid entry.' });
      }
      if (weather.temperature > 42) {
        alerts.push({ area: area.area, type: 'EXTREME_HEAT', severity: 'MEDIUM', message: 'Extreme heat warning. Reduce underground time. Ensure hydration.' });
      }
      if (weather.windSpeed > 60) {
        alerts.push({ area: area.area, type: 'HIGH_WIND', severity: 'MEDIUM', message: 'High wind advisory. Secure equipment at manhole openings.' });
      }
    }

    return alerts;
  }
}
