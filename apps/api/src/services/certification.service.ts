import prisma from '../config/database';
import { REQUIRED_CERTIFICATIONS } from '@manholeguard/shared/src/constants/fatigue-limits';
import { logger } from '../utils/logger';

export class CertificationService {
  async hasValidCerts(workerId: string): Promise<boolean> {
    const certs = await prisma.workerCertification.findMany({
      where: { workerId, isValid: true, expiresAt: { gt: new Date() } },
    });

    return REQUIRED_CERTIFICATIONS.every(req =>
      certs.some((c: any) => c.type === req)
    );
  }

  async create(data: {
    workerId: string; type: string; certificateNumber?: string;
    issuedAt: string; expiresAt: string; issuedBy?: string; documentUrl?: string;
  }) {
    return prisma.workerCertification.create({
      data: {
        workerId: data.workerId,
        type: data.type as any,
        certificateNumber: data.certificateNumber,
        issuedAt: new Date(data.issuedAt),
        expiresAt: new Date(data.expiresAt),
        issuedBy: data.issuedBy,
        documentUrl: data.documentUrl,
      },
    });
  }

  async getByWorker(workerId: string) {
    return prisma.workerCertification.findMany({
      where: { workerId },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async getExpiring(days: number = 30) {
    const cutoff = new Date(Date.now() + days * 86400000);
    return prisma.workerCertification.findMany({
      where: { isValid: true, expiresAt: { lte: cutoff } },
      include: { worker: true },
    });
  }

  async checkExpiringCerts() {
    const now = new Date();

    // Mark expired certs
    await prisma.workerCertification.updateMany({
      where: { isValid: true, expiresAt: { lt: now } },
      data: { isValid: false },
    });

    const expiringSoon = await this.getExpiring(7);
    if (expiringSoon.length > 0) {
      logger.warn(`${expiringSoon.length} certifications expiring within 7 days`);
    }

    return expiringSoon;
  }

  async delete(id: string) {
    return prisma.workerCertification.delete({ where: { id } });
  }
}
