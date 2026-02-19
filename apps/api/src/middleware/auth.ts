import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase-admin';
import prisma from '../config/database';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
    return;
  }

  const token = authHeader.split(' ')[1];

  firebaseAuth
    .verifyIdToken(token)
    .then(async (decoded) => {
      // Look up Prisma user by Firebase UID — keeps req.user.id as Prisma UUID
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decoded.uid },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account not found or inactive' } });
        return;
      }

      req.user = { id: user.id, email: user.email, role: user.role };
      next();
    })
    .catch(() => {
      res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
    });
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
      return;
    }
    next();
  };
}
