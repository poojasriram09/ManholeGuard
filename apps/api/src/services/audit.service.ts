import prisma from '../config/database';
import { computeAuditHash } from '../utils/crypto';

export class AuditService {
  async log(data: {
    userId?: string; action: string; entityType: string; entityId?: string;
    oldValue?: any; newValue?: any; ipAddress?: string; userAgent?: string;
  }) {
    const lastLog = await prisma.auditLog.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { hashChain: true },
    });

    const payload = {
      previousHash: lastLog?.hashChain || 'GENESIS',
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      timestamp: new Date().toISOString(),
    };

    const hash = computeAuditHash(payload);

    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action as any,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValue: data.oldValue,
        newValue: data.newValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        hashChain: hash,
      },
    });
  }

  async getAll(filters?: { userId?: string; action?: string; entityType?: string; from?: Date; to?: Date }, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.action && { action: filters.action as any }),
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.from && { timestamp: { gte: filters.from } }),
        ...(filters?.to && { timestamp: { lte: filters.to } }),
      },
      include: { user: { select: { email: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async verifyIntegrity(from?: Date, to?: Date) {
    const logs = await prisma.auditLog.findMany({
      where: {
        ...(from && { timestamp: { gte: from } }),
        ...(to && { timestamp: { lte: to } }),
      },
      orderBy: { timestamp: 'asc' },
    });

    let previousHash = 'GENESIS';
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const payload = {
        previousHash,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        userId: log.userId,
        timestamp: log.timestamp.toISOString(),
      };

      const expected = computeAuditHash(payload);
      if (log.hashChain !== expected) {
        return { valid: false, checkedCount: i + 1, brokenAt: log.id };
      }
      previousHash = log.hashChain!;
    }

    return { valid: true, checkedCount: logs.length };
  }
}
