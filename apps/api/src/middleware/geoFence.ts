import { Request, Response, NextFunction } from 'express';
import { haversineDistance } from '../utils/geo-utils';
import { env } from '../config/env';
import prisma from '../config/database';

export async function verifyGeoFence(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { manholeId, latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    if (env.GEOFENCE_STRICT_MODE) {
      res.status(400).json({
        success: false,
        error: { code: 'GEO_FENCE_VIOLATION', message: 'Location data is required' },
      });
      return;
    }
    next();
    return;
  }

  const manhole = await prisma.manhole.findUnique({ where: { id: manholeId } });
  if (!manhole) {
    res.status(404).json({
      success: false,
      error: { code: 'MANHOLE_NOT_FOUND', message: 'Manhole not found' },
    });
    return;
  }

  const distance = haversineDistance(latitude, longitude, manhole.latitude, manhole.longitude);
  const radius = manhole.geoFenceRadius || env.GEOFENCE_RADIUS_METERS;

  if (distance > radius) {
    if (env.GEOFENCE_STRICT_MODE) {
      res.status(403).json({
        success: false,
        error: {
          code: 'GEO_FENCE_VIOLATION',
          message: `You are ${Math.round(distance)}m away. Move within ${radius}m of the manhole.`,
        },
      });
      return;
    }
    // In non-strict mode, flag but allow
    req.body._geoVerified = false;
  } else {
    req.body._geoVerified = true;
  }

  next();
}
