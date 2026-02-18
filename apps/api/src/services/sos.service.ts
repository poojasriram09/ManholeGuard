import prisma from '../config/database';
import { NearestFacilityService } from './nearest-facility.service';
import { logger } from '../utils/logger';

export class SOSService {
  private facilityService = new NearestFacilityService();

  async triggerSOS(data: {
    workerId: string; entryLogId?: string;
    latitude?: number; longitude?: number; method: string;
  }) {
    let lat = data.latitude;
    let lng = data.longitude;

    // Try to get location from manhole if not provided
    if (!lat && data.entryLogId) {
      const entry = await prisma.entryLog.findUnique({
        where: { id: data.entryLogId },
        include: { manhole: true },
      });
      if (entry?.manhole) {
        lat = entry.manhole.latitude;
        lng = entry.manhole.longitude;
      }
    }

    let nearestHospital: string | undefined;
    let hospitalDistance: number | undefined;
    let nearestFireStation: string | undefined;

    if (lat && lng) {
      try {
        const hospital = await this.facilityService.findNearest(lat, lng, 'hospital');
        nearestHospital = hospital?.name;
        hospitalDistance = hospital?.distanceKm;
        const fire = await this.facilityService.findNearest(lat, lng, 'fire_station');
        nearestFireStation = fire?.name;
      } catch (e) {
        logger.error('Failed to find nearest facilities', e);
      }
    }

    const sos = await prisma.sOSRecord.create({
      data: {
        workerId: data.workerId,
        entryLogId: data.entryLogId,
        latitude: lat,
        longitude: lng,
        triggerMethod: data.method,
        nearestHospital,
        hospitalDistance,
        nearestFireStation,
      },
    });

    // Update entry state
    if (data.entryLogId) {
      await prisma.entryLog.update({
        where: { id: data.entryLogId },
        data: { state: 'SOS_TRIGGERED' },
      });
    }

    // Create critical incident
    if (data.entryLogId) {
      const entry = await prisma.entryLog.findUnique({ where: { id: data.entryLogId } });
      if (entry) {
        await prisma.incident.create({
          data: {
            manholeId: entry.manholeId,
            workerId: data.workerId,
            entryLogId: data.entryLogId,
            incidentType: 'SOS_EMERGENCY',
            severity: 'CRITICAL',
            description: `SOS triggered via ${data.method}`,
          },
        });
      }
    }

    logger.warn(`SOS TRIGGERED: worker=${data.workerId} method=${data.method}`);
    return sos;
  }

  async resolveSOS(sosId: string, outcome: string) {
    return prisma.sOSRecord.update({
      where: { id: sosId },
      data: { resolvedAt: new Date(), outcome },
    });
  }

  async getActive() {
    return prisma.sOSRecord.findMany({
      where: { resolvedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
