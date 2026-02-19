import prisma from '../config/database';
import { env } from '../config/env';
import { generateTrackingCode } from '../utils/crypto';
import { AppError } from '../middleware/errorHandler';
import { haversineDistance } from '../utils/geo-utils';
import { logger } from '../utils/logger';

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
      let minDist = Infinity;
      for (const m of manholes) {
        const dist = haversineDistance(data.latitude, data.longitude, m.latitude, m.longitude);
        if (dist <= 100 && dist < minDist) {
          manholeId = m.id;
          minDist = dist;
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

  /** Check SLA compliance — grievances open longer than allowed period */
  async checkSLACompliance() {
    const autoCloseDays = env.GRIEVANCE_AUTO_CLOSE_DAYS;
    const threshold = new Date(Date.now() - autoCloseDays * 86400000);

    const overdue = await prisma.grievance.findMany({
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'] },
        createdAt: { lt: threshold },
      },
    });

    const results = [];
    for (const g of overdue) {
      const daysOpen = Math.ceil((Date.now() - g.createdAt.getTime()) / 86400000);
      results.push({ id: g.id, trackingCode: g.trackingCode, daysOpen, status: g.status });
    }

    if (results.length > 0) {
      logger.warn(`${results.length} grievances exceed SLA of ${autoCloseDays} days`);
    }

    return results;
  }

  /** Auto-escalate unaddressed grievances */
  async autoEscalate() {
    const escalationDays = 7;
    const threshold = new Date(Date.now() - escalationDays * 86400000);

    // Escalate SUBMITTED → UNDER_REVIEW after 7 days
    const escalated = await prisma.grievance.updateMany({
      where: {
        status: 'SUBMITTED',
        createdAt: { lt: threshold },
      },
      data: { status: 'UNDER_REVIEW' },
    });

    if (escalated.count > 0) {
      logger.info(`Auto-escalated ${escalated.count} grievances to UNDER_REVIEW`);
    }

    return escalated.count;
  }

  /** Link grievance to a maintenance task */
  async linkToMaintenance(grievanceId: string, maintenanceId: string) {
    // Update grievance status and add note about linked maintenance
    await prisma.grievance.update({
      where: { id: grievanceId },
      data: {
        status: 'IN_PROGRESS',
        resolutionNotes: `Linked to maintenance task: ${maintenanceId}`,
      },
    });

    return { grievanceId, maintenanceId, linked: true };
  }
}
