import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

vi.mock('../../config/database', () => ({
  default: {
    auditLog: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../../utils/crypto', () => ({
  computeAuditHash: vi.fn((payload: Record<string, unknown>) => {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }),
}));

import prisma from '../../config/database';
import { AuditService } from '../../services/audit.service';
import { computeAuditHash } from '../../utils/crypto';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuditService();
  });

  describe('log', () => {
    it('should create audit log with hash chain using GENESIS as first hash', async () => {
      vi.mocked(prisma.auditLog.findFirst).mockResolvedValueOnce(null); // No previous log

      const mockCreated = {
        id: 'audit-1',
        userId: 'user-1',
        action: 'ENTRY_START',
        entityType: 'EntryLog',
        entityId: 'entry-1',
        oldValue: null,
        newValue: { state: 'ENTERED' },
        ipAddress: '192.168.1.1',
        userAgent: 'ManholeGuard-PWA/1.0',
        hashChain: 'some-hash',
        timestamp: new Date(),
      };

      vi.mocked(prisma.auditLog.create).mockResolvedValueOnce(mockCreated as any);

      const result = await service.log({
        userId: 'user-1',
        action: 'ENTRY_START',
        entityType: 'EntryLog',
        entityId: 'entry-1',
        newValue: { state: 'ENTERED' },
        ipAddress: '192.168.1.1',
        userAgent: 'ManholeGuard-PWA/1.0',
      });

      expect(result.id).toBe('audit-1');

      // Verify the hash was computed with GENESIS as previous
      expect(computeAuditHash).toHaveBeenCalledWith(
        expect.objectContaining({
          previousHash: 'GENESIS',
          action: 'ENTRY_START',
          entityType: 'EntryLog',
          entityId: 'entry-1',
          userId: 'user-1',
        })
      );

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          action: 'ENTRY_START',
          entityType: 'EntryLog',
          entityId: 'entry-1',
          hashChain: expect.any(String),
        }),
      });
    });

    it('should chain hash to previous audit log hash', async () => {
      const previousHash = 'abc123def456previous';
      vi.mocked(prisma.auditLog.findFirst).mockResolvedValueOnce({
        hashChain: previousHash,
      } as any);

      vi.mocked(prisma.auditLog.create).mockResolvedValueOnce({
        id: 'audit-2',
        hashChain: 'new-hash-value',
      } as any);

      await service.log({
        userId: 'user-2',
        action: 'ENTRY_EXIT',
        entityType: 'EntryLog',
        entityId: 'entry-2',
      });

      expect(computeAuditHash).toHaveBeenCalledWith(
        expect.objectContaining({
          previousHash: previousHash,
          action: 'ENTRY_EXIT',
        })
      );
    });
  });

  describe('verifyIntegrity', () => {
    it('should return valid for consistent chain', async () => {
      // Build a real chain of 3 logs
      const genesisPayload = {
        previousHash: 'GENESIS',
        action: 'LOGIN',
        entityType: 'User',
        entityId: 'user-1',
        userId: 'user-1',
        timestamp: '2026-02-19T08:00:00.000Z',
      };
      const hash1 = crypto.createHash('sha256').update(JSON.stringify(genesisPayload)).digest('hex');

      const secondPayload = {
        previousHash: hash1,
        action: 'ENTRY_START',
        entityType: 'EntryLog',
        entityId: 'entry-1',
        userId: 'user-1',
        timestamp: '2026-02-19T09:00:00.000Z',
      };
      const hash2 = crypto.createHash('sha256').update(JSON.stringify(secondPayload)).digest('hex');

      const thirdPayload = {
        previousHash: hash2,
        action: 'ENTRY_EXIT',
        entityType: 'EntryLog',
        entityId: 'entry-1',
        userId: 'user-1',
        timestamp: '2026-02-19T09:30:00.000Z',
      };
      const hash3 = crypto.createHash('sha256').update(JSON.stringify(thirdPayload)).digest('hex');

      vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([
        {
          id: 'log-1',
          userId: 'user-1',
          action: 'LOGIN',
          entityType: 'User',
          entityId: 'user-1',
          hashChain: hash1,
          timestamp: new Date('2026-02-19T08:00:00.000Z'),
        },
        {
          id: 'log-2',
          userId: 'user-1',
          action: 'ENTRY_START',
          entityType: 'EntryLog',
          entityId: 'entry-1',
          hashChain: hash2,
          timestamp: new Date('2026-02-19T09:00:00.000Z'),
        },
        {
          id: 'log-3',
          userId: 'user-1',
          action: 'ENTRY_EXIT',
          entityType: 'EntryLog',
          entityId: 'entry-1',
          hashChain: hash3,
          timestamp: new Date('2026-02-19T09:30:00.000Z'),
        },
      ] as any);

      const result = await service.verifyIntegrity();

      expect(result.valid).toBe(true);
      expect(result.checkedCount).toBe(3);
    });

    it('should detect broken chain (tampered record)', async () => {
      const genesisPayload = {
        previousHash: 'GENESIS',
        action: 'LOGIN',
        entityType: 'User',
        entityId: 'user-1',
        userId: 'user-1',
        timestamp: '2026-02-19T08:00:00.000Z',
      };
      const hash1 = crypto.createHash('sha256').update(JSON.stringify(genesisPayload)).digest('hex');

      vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([
        {
          id: 'log-1',
          userId: 'user-1',
          action: 'LOGIN',
          entityType: 'User',
          entityId: 'user-1',
          hashChain: hash1,
          timestamp: new Date('2026-02-19T08:00:00.000Z'),
        },
        {
          id: 'log-2',
          userId: 'user-1',
          action: 'ENTRY_START',
          entityType: 'EntryLog',
          entityId: 'entry-1',
          hashChain: 'TAMPERED_HASH_VALUE', // This is wrong!
          timestamp: new Date('2026-02-19T09:00:00.000Z'),
        },
      ] as any);

      const result = await service.verifyIntegrity();

      expect(result.valid).toBe(false);
      expect(result.brokenAt).toBe('log-2');
      expect(result.checkedCount).toBe(2);
    });

    it('should return valid for empty chain', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValueOnce([]);

      const result = await service.verifyIntegrity();

      expect(result.valid).toBe(true);
      expect(result.checkedCount).toBe(0);
    });
  });
});
