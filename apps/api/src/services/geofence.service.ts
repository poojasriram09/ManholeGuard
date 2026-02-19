import prisma from '../config/database';
import { env } from '../config/env';
import { haversineDistance } from '../utils/geo-utils';
import { logger } from '../utils/logger';

interface ProximityResult {
  withinFence: boolean;
  distance: number;
  maxRadius: number;
}

export class GeofenceService {
  /** Verify worker proximity to a manhole */
  async verifyProximity(
    manholeId: string,
    workerLat: number,
    workerLng: number
  ): Promise<ProximityResult> {
    const manhole = await prisma.manhole.findUnique({
      where: { id: manholeId },
      select: { latitude: true, longitude: true, geoFenceRadius: true },
    });

    if (!manhole) {
      throw new Error(`Manhole ${manholeId} not found`);
    }

    const distance = haversineDistance(
      workerLat,
      workerLng,
      manhole.latitude,
      manhole.longitude
    );

    const maxRadius = manhole.geoFenceRadius || env.GEOFENCE_RADIUS_METERS;

    return {
      withinFence: distance <= maxRadius,
      distance: Math.round(distance * 100) / 100,
      maxRadius,
    };
  }

  /** Batch re-validation of active entries (periodic drift check) */
  async checkActiveEntryProximity(): Promise<Array<{
    entryId: string;
    workerId: string;
    distance: number;
    withinFence: boolean;
  }>> {
    const activeEntries = await prisma.entryLog.findMany({
      where: { status: 'ACTIVE', geoVerified: true },
      include: {
        manhole: { select: { latitude: true, longitude: true, geoFenceRadius: true } },
      },
    });

    const results = [];
    for (const entry of activeEntries) {
      if (!entry.geoLatitude || !entry.geoLongitude) continue;

      const distance = haversineDistance(
        entry.geoLatitude,
        entry.geoLongitude,
        entry.manhole.latitude,
        entry.manhole.longitude
      );

      const maxRadius = entry.manhole.geoFenceRadius || env.GEOFENCE_RADIUS_METERS;
      const withinFence = distance <= maxRadius;

      if (!withinFence) {
        logger.warn(
          `Entry ${entry.id} outside geofence: ${Math.round(distance)}m > ${maxRadius}m`
        );
      }

      results.push({
        entryId: entry.id,
        workerId: entry.workerId,
        distance: Math.round(distance * 100) / 100,
        withinFence,
      });
    }

    return results;
  }
}
