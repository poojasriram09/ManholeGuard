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

  /** Renew a certification by creating a new one and invalidating the old */
  async renew(oldCertId: string, data: {
    certificateNumber?: string;
    issuedAt: string;
    expiresAt: string;
    issuedBy?: string;
    documentUrl?: string;
  }) {
    const oldCert = await prisma.workerCertification.findUnique({ where: { id: oldCertId } });
    if (!oldCert) throw new Error('Certification not found');

    // Invalidate old cert
    await prisma.workerCertification.update({
      where: { id: oldCertId },
      data: { isValid: false },
    });

    // Create new cert
    const newCert = await prisma.workerCertification.create({
      data: {
        workerId: oldCert.workerId,
        type: oldCert.type,
        certificateNumber: data.certificateNumber || oldCert.certificateNumber,
        issuedAt: new Date(data.issuedAt),
        expiresAt: new Date(data.expiresAt),
        issuedBy: data.issuedBy || oldCert.issuedBy,
        documentUrl: data.documentUrl || oldCert.documentUrl,
      },
    });

    logger.info(`Certification renewed: worker=${oldCert.workerId} type=${oldCert.type}`);
    return newCert;
  }

  /** Bulk check: find all workers with expired mandatory certifications */
  async bulkExpiryCheck() {
    const workers = await prisma.worker.findMany({
      include: {
        certifications: {
          where: { isValid: true },
        },
      },
    });

    const noncompliant = [];
    for (const worker of workers) {
      const missingCerts = REQUIRED_CERTIFICATIONS.filter(
        (req) => !worker.certifications.some((c: any) => c.type === req && c.expiresAt > new Date())
      );

      if (missingCerts.length > 0) {
        noncompliant.push({
          workerId: worker.id,
          workerName: worker.name,
          employeeId: worker.employeeId,
          missingCerts,
        });
      }
    }

    return noncompliant;
  }
}
