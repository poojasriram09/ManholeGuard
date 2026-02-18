import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  async register(email: string, password: string, role: string = 'WORKER', language: string = 'en') {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: role as any, language },
    });

    const token = this.generateToken(user);
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = this.generateToken(user);
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  private generateToken(user: { id: string; email: string; role: string }): string {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '24h' });
  }
}
