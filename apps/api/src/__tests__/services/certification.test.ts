import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/database', () => ({
  default: {
    workerCertification: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    worker: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@manholeguard/shared/src/constants/fatigue-limits', () => ({
  REQUIRED_CERTIFICATIONS: ['SAFETY_TRAINING', 'CONFINED_SPACE', 'MEDICAL_FITNESS'],
  FATIGUE_LIMITS: {
    MAX_ENTRIES_PER_SHIFT: 4,
    MAX_UNDERGROUND_MINUTES_PER_SHIFT: 120,
    MIN_REST_BETWEEN_ENTRIES_MINUTES: 15,
    MAX_SHIFT_HOURS: 10,
  },
  HEALTH_SYMPTOMS: [],
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import prisma from '../../config/database';
import { CertificationService } from '../../services/certification.service';
import { logger } from '../../utils/logger';

describe('CertificationService', () => {
  let service: CertificationService;

  const futureDate = new Date(Date.now() + 90 * 86400000); // 90 days from now
  const pastDate = new Date(Date.now() - 30 * 86400000); // 30 days ago

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CertificationService();
  });

  describe('hasValidCerts', () => {
    it('should return true when all 3 required certs are valid', async () => {
      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([
        { type: 'SAFETY_TRAINING', isValid: true, expiresAt: futureDate },
        { type: 'CONFINED_SPACE', isValid: true, expiresAt: futureDate },
        { type: 'MEDICAL_FITNESS', isValid: true, expiresAt: futureDate },
      ] as any);

      const result = await service.hasValidCerts('worker-1');

      expect(result).toBe(true);
    });

    it('should return false when one required cert is missing', async () => {
      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([
        { type: 'SAFETY_TRAINING', isValid: true, expiresAt: futureDate },
        { type: 'CONFINED_SPACE', isValid: true, expiresAt: futureDate },
        // MEDICAL_FITNESS missing
      ] as any);

      const result = await service.hasValidCerts('worker-2');

      expect(result).toBe(false);
    });

    it('should return false when a cert is expired (filtered by DB query)', async () => {
      // The DB query filters by expiresAt > now, so expired certs are excluded from results
      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([
        { type: 'SAFETY_TRAINING', isValid: true, expiresAt: futureDate },
        { type: 'CONFINED_SPACE', isValid: true, expiresAt: futureDate },
        // MEDICAL_FITNESS expired — not returned by DB
      ] as any);

      const result = await service.hasValidCerts('worker-3');

      expect(result).toBe(false);
    });

    it('should return false when worker has zero certifications', async () => {
      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([]);

      const result = await service.hasValidCerts('worker-4');

      expect(result).toBe(false);
    });

    it('should query with correct filters', async () => {
      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([]);

      await service.hasValidCerts('worker-5');

      expect(prisma.workerCertification.findMany).toHaveBeenCalledWith({
        where: {
          workerId: 'worker-5',
          isValid: true,
          expiresAt: { gt: expect.any(Date) },
        },
      });
    });
  });

  describe('checkExpiringCerts', () => {
    it('should mark expired certs as invalid', async () => {
      vi.mocked(prisma.workerCertification.updateMany).mockResolvedValueOnce({ count: 2 } as any);
      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([]);

      await service.checkExpiringCerts();

      expect(prisma.workerCertification.updateMany).toHaveBeenCalledWith({
        where: { isValid: true, expiresAt: { lt: expect.any(Date) } },
        data: { isValid: false },
      });
    });

    it('should return certs expiring within 7 days', async () => {
      vi.mocked(prisma.workerCertification.updateMany).mockResolvedValueOnce({ count: 0 } as any);

      const expiringCert = {
        id: 'cert-exp',
        type: 'SAFETY_TRAINING',
        expiresAt: new Date(Date.now() + 5 * 86400000), // 5 days from now
        worker: { id: 'worker-1', name: 'Ramesh Kumar' },
      };

      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([expiringCert] as any);

      const result = await service.checkExpiringCerts();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('cert-exp');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('1 certifications expiring within 7 days')
      );
    });

    it('should not warn when no certs are expiring', async () => {
      vi.mocked(prisma.workerCertification.updateMany).mockResolvedValueOnce({ count: 0 } as any);
      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([]);

      const result = await service.checkExpiringCerts();

      expect(result).toHaveLength(0);
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('renew', () => {
    it('should invalidate old cert and create new one with inherited fields', async () => {
      const oldCert = {
        id: 'cert-old',
        workerId: 'worker-1',
        type: 'SAFETY_TRAINING',
        certificateNumber: 'ST-001',
        issuedBy: 'Safety Board',
        documentUrl: 'https://example.com/cert.pdf',
      };

      vi.mocked(prisma.workerCertification.findUnique).mockResolvedValueOnce(oldCert as any);
      vi.mocked(prisma.workerCertification.update).mockResolvedValueOnce({
        ...oldCert,
        isValid: false,
      } as any);

      const newCert = {
        id: 'cert-new',
        workerId: 'worker-1',
        type: 'SAFETY_TRAINING',
        certificateNumber: 'ST-002',
        issuedBy: 'Safety Board',
        isValid: true,
      };
      vi.mocked(prisma.workerCertification.create).mockResolvedValueOnce(newCert as any);

      const result = await service.renew('cert-old', {
        certificateNumber: 'ST-002',
        issuedAt: '2026-03-01',
        expiresAt: '2027-03-01',
      });

      // Old cert invalidated
      expect(prisma.workerCertification.update).toHaveBeenCalledWith({
        where: { id: 'cert-old' },
        data: { isValid: false },
      });

      // New cert created with old's workerId and type
      expect(prisma.workerCertification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workerId: 'worker-1',
          type: 'SAFETY_TRAINING',
          certificateNumber: 'ST-002',
          issuedBy: 'Safety Board', // inherited from old cert
          documentUrl: 'https://example.com/cert.pdf', // inherited from old cert
        }),
      });

      expect(result.id).toBe('cert-new');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Certification renewed')
      );
    });

    it('should throw when old cert not found', async () => {
      vi.mocked(prisma.workerCertification.findUnique).mockResolvedValueOnce(null);

      await expect(
        service.renew('non-existent', {
          issuedAt: '2026-03-01',
          expiresAt: '2027-03-01',
        })
      ).rejects.toThrow('Certification not found');
    });

    it('should use new values when provided, falling back to old cert values', async () => {
      const oldCert = {
        id: 'cert-old-2',
        workerId: 'worker-2',
        type: 'CONFINED_SPACE',
        certificateNumber: 'CS-001',
        issuedBy: 'Old Board',
        documentUrl: 'https://example.com/old.pdf',
      };

      vi.mocked(prisma.workerCertification.findUnique).mockResolvedValueOnce(oldCert as any);
      vi.mocked(prisma.workerCertification.update).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.workerCertification.create).mockResolvedValueOnce({ id: 'cert-new-2' } as any);

      await service.renew('cert-old-2', {
        issuedAt: '2026-03-01',
        expiresAt: '2027-03-01',
        issuedBy: 'New Board',
        documentUrl: 'https://example.com/new.pdf',
      });

      expect(prisma.workerCertification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          issuedBy: 'New Board',
          documentUrl: 'https://example.com/new.pdf',
        }),
      });
    });
  });

  describe('bulkExpiryCheck', () => {
    it('should return workers with missing required certs', async () => {
      vi.mocked(prisma.worker.findMany).mockResolvedValueOnce([
        {
          id: 'worker-1',
          name: 'Ramesh Kumar',
          employeeId: 'EMP001',
          certifications: [
            { type: 'SAFETY_TRAINING', isValid: true, expiresAt: futureDate },
            // Missing CONFINED_SPACE and MEDICAL_FITNESS
          ],
        },
        {
          id: 'worker-2',
          name: 'Suresh Patil',
          employeeId: 'EMP002',
          certifications: [
            { type: 'SAFETY_TRAINING', isValid: true, expiresAt: futureDate },
            { type: 'CONFINED_SPACE', isValid: true, expiresAt: futureDate },
            { type: 'MEDICAL_FITNESS', isValid: true, expiresAt: futureDate },
          ],
        },
      ] as any);

      const result = await service.bulkExpiryCheck();

      expect(result).toHaveLength(1);
      expect(result[0].workerId).toBe('worker-1');
      expect(result[0].workerName).toBe('Ramesh Kumar');
      expect(result[0].missingCerts).toContain('CONFINED_SPACE');
      expect(result[0].missingCerts).toContain('MEDICAL_FITNESS');
    });

    it('should return empty array when all workers are compliant', async () => {
      vi.mocked(prisma.worker.findMany).mockResolvedValueOnce([
        {
          id: 'worker-1',
          name: 'Ramesh',
          employeeId: 'EMP001',
          certifications: [
            { type: 'SAFETY_TRAINING', isValid: true, expiresAt: futureDate },
            { type: 'CONFINED_SPACE', isValid: true, expiresAt: futureDate },
            { type: 'MEDICAL_FITNESS', isValid: true, expiresAt: futureDate },
          ],
        },
      ] as any);

      const result = await service.bulkExpiryCheck();

      expect(result).toHaveLength(0);
    });

    it('should detect workers with expired certs as noncompliant', async () => {
      vi.mocked(prisma.worker.findMany).mockResolvedValueOnce([
        {
          id: 'worker-exp',
          name: 'Expired Worker',
          employeeId: 'EMP003',
          certifications: [
            { type: 'SAFETY_TRAINING', isValid: true, expiresAt: futureDate },
            { type: 'CONFINED_SPACE', isValid: true, expiresAt: pastDate }, // expired
            { type: 'MEDICAL_FITNESS', isValid: true, expiresAt: futureDate },
          ],
        },
      ] as any);

      const result = await service.bulkExpiryCheck();

      expect(result).toHaveLength(1);
      expect(result[0].missingCerts).toContain('CONFINED_SPACE');
    });

    it('should handle workers with zero certifications', async () => {
      vi.mocked(prisma.worker.findMany).mockResolvedValueOnce([
        {
          id: 'worker-none',
          name: 'No Certs Worker',
          employeeId: 'EMP004',
          certifications: [],
        },
      ] as any);

      const result = await service.bulkExpiryCheck();

      expect(result).toHaveLength(1);
      expect(result[0].missingCerts).toHaveLength(3);
    });
  });

  describe('create', () => {
    it('should create a certification with correct date conversions', async () => {
      vi.mocked(prisma.workerCertification.create).mockResolvedValueOnce({
        id: 'cert-new',
        workerId: 'worker-1',
        type: 'SAFETY_TRAINING',
      } as any);

      await service.create({
        workerId: 'worker-1',
        type: 'SAFETY_TRAINING',
        certificateNumber: 'ST-100',
        issuedAt: '2026-01-01',
        expiresAt: '2027-01-01',
        issuedBy: 'Safety Board',
      });

      expect(prisma.workerCertification.create).toHaveBeenCalledWith({
        data: {
          workerId: 'worker-1',
          type: 'SAFETY_TRAINING',
          certificateNumber: 'ST-100',
          issuedAt: expect.any(Date),
          expiresAt: expect.any(Date),
          issuedBy: 'Safety Board',
          documentUrl: undefined,
        },
      });
    });
  });

  describe('getByWorker', () => {
    it('should return certs ordered by expiresAt ascending', async () => {
      vi.mocked(prisma.workerCertification.findMany).mockResolvedValueOnce([
        { id: 'cert-a', expiresAt: new Date('2026-06-01') },
        { id: 'cert-b', expiresAt: new Date('2027-01-01') },
      ] as any);

      const result = await service.getByWorker('worker-1');

      expect(result).toHaveLength(2);
      expect(prisma.workerCertification.findMany).toHaveBeenCalledWith({
        where: { workerId: 'worker-1' },
        orderBy: { expiresAt: 'asc' },
      });
    });
  });

  describe('delete', () => {
    it('should delete certification by id', async () => {
      vi.mocked(prisma.workerCertification.delete).mockResolvedValueOnce({ id: 'cert-del' } as any);

      await service.delete('cert-del');

      expect(prisma.workerCertification.delete).toHaveBeenCalledWith({
        where: { id: 'cert-del' },
      });
    });
  });
});
