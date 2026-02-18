import prisma from '../config/database';
import { generateTrackingCode } from '../utils/crypto';
import { AppError } from '../middleware/errorHandler';
import { haversineDistance } from '../utils/geo-utils';

export class GrievanceService {
  async create(data: {
    reporterName: string; reporterPhone: string; reporterEmail?: string;
    issueType: string; description: string;
    latitude?: number; longitude?: number; address?: string;
    photoUrls?: string[];
  }) {
    let manholeId: string | undefined;

    // Auto-match to nearest manhole within 100m
    if (data.latitude && data.longitude) {
      const manholes = await prisma.manhole.findMany();
      for (const m of manholes) {
        const dist = haversineDistance(data.latitude, data.longitude, m.latitude, m.longitude);
        if (dist <= 100) {
          manholeId = m.id;
          break;
        }
      }
    }

    const trackingCode = generateTrackingCode();

    return prisma.grievance.create({
      data: {
        reporterName: data.reporterName,
        reporterPhone: data.reporterPhone,
        reporterEmail: data.reporterEmail,
        issueType: data.issueType,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        photoUrls: data.photoUrls ?? [],
        trackingCode,
        manholeId,
      },
    });
  }

  async getByTrackingCode(code: string) {
    const grievance = await prisma.grievance.findUnique({ where: { trackingCode: code } });
    if (!grievance) throw new AppError(404, 'INVALID_TRACKING_CODE', 'Invalid tracking code');
    return grievance;
  }

  async getAll(filters?: { status?: string }) {
    return prisma.grievance.findMany({
      where: filters?.status ? { status: filters.status as any } : undefined,
      include: { manhole: { select: { area: true, qrCodeId: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string, resolutionNotes?: string) {
    return prisma.grievance.update({
      where: { id },
      data: {
        status: status as any,
        resolutionNotes,
        resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
      },
    });
  }
}
