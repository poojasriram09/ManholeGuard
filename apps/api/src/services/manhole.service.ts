import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class ManholeService {
  async create(data: {
    qrCodeId: string; latitude: number; longitude: number; area: string;
    address?: string; depth?: number; diameter?: number; maxWorkers?: number;
    geoFenceRadius?: number; hasGasSensor?: boolean; sensorDeviceId?: string;
  }) {
    return prisma.manhole.create({ data });
  }

  async getAll(filters?: { area?: string; riskLevel?: string }) {
    return prisma.manhole.findMany({
      where: {
        ...(filters?.area && { area: filters.area }),
        ...(filters?.riskLevel && { riskLevel: filters.riskLevel as any }),
      },
      orderBy: { area: 'asc' },
    });
  }

  async getById(id: string) {
    const manhole = await prisma.manhole.findUnique({ where: { id } });
    if (!manhole) throw new AppError(404, 'MANHOLE_NOT_FOUND', 'Manhole not found');
    return manhole;
  }

  async getByQrCode(qrCodeId: string) {
    const manhole = await prisma.manhole.findUnique({ where: { qrCodeId } });
    if (!manhole) throw new AppError(404, 'INVALID_QR', 'Invalid QR code');
    return manhole;
  }

  async update(id: string, data: Partial<{
    riskLevel: string; riskScore: number; lastCleanedAt: Date;
    nextMaintenanceAt: Date; nearestHospital: string; nearestHospitalDist: number;
    nearestFireStation: string;
  }>) {
    return prisma.manhole.update({ where: { id }, data: data as any });
  }

  async getActiveWorkerCount(manholeId: string): Promise<number> {
    return prisma.entryLog.count({
      where: { manholeId, status: 'ACTIVE' },
    });
  }

  async getHeatmapData() {
    return prisma.manhole.findMany({
      select: {
        id: true, latitude: true, longitude: true, area: true,
        riskLevel: true, riskScore: true, qrCodeId: true, hasGasSensor: true,
      },
    });
  }
}
