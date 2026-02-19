import { Request, Response, NextFunction } from 'express';
import { computeAuditHash } from '../utils/crypto';
import prisma from '../config/database';

export function auditLog(action: string, entityType: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      // Log after response is sent
      if (res.statusCode < 400 && req.user) {
        const lastLog = prisma.auditLog.findFirst({
          orderBy: { timestamp: 'desc' },
          select: { hashChain: true },
        });

        lastLog.then((last) => {
          const payload = {
            previousHash: last?.hashChain || 'GENESIS',
            action,
            entityType,
            entityId: req.params.id || body?.data?.id,
            userId: req.user!.id,
            timestamp: new Date().toISOString(),
          };

          const hash = computeAuditHash(payload);

          prisma.auditLog.create({
            data: {
              userId: req.user!.id,
              action: action as any,
              entityType,
              entityId: req.params.id || body?.data?.id,
              ipAddress: req.ip,
              userAgent: req.get('user-agent'),
              hashChain: hash,
            },
          }).catch(() => {}); // Fire and forget
        });
      }
      return originalJson(body);
    };
    next();
  };
}
