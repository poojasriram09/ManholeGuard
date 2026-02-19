import prisma from '../config/database';
import { firebaseAuth } from '../config/firebase-admin';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  /**
   * Register a new user (admin-only).
   * Creates the user in Firebase Auth, sets custom claims, then creates the Prisma record.
   */
  async register(email: string, password: string, role: string = 'WORKER', language: string = 'en') {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');

    // Create Firebase Auth user
    const firebaseUser = await firebaseAuth.createUser({
      email,
      password,
      emailVerified: true,
    });

    // Set custom claims for role
    await firebaseAuth.setCustomUserClaims(firebaseUser.uid, { role });

    // Create Prisma user linked via firebaseUid
    const user = await prisma.user.create({
      data: {
        email,
        firebaseUid: firebaseUser.uid,
        role: role as any,
        language,
      },
    });

    return { user: { id: user.id, email: user.email, role: user.role } };
  }

  /**
   * Sync a Firebase user after login (called from frontend after signIn).
   * If user exists in Prisma, update lastLoginAt. If not (e.g. Google sign-in first time),
   * create the Prisma record.
   */
  async syncFirebaseUser(firebaseUid: string, email: string) {
    let user = await prisma.user.findUnique({ where: { firebaseUid } });

    if (user) {
      // Existing user — update login time
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } else {
      // Check if a Prisma user exists with this email but no firebaseUid (migration case)
      const existingByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { firebaseUid, lastLoginAt: new Date() },
        });
      } else {
        // New Google sign-in user — create with default WORKER role
        // Set custom claims in Firebase
        await firebaseAuth.setCustomUserClaims(firebaseUid, { role: 'WORKER' });

        user = await prisma.user.create({
          data: {
            email,
            firebaseUid,
            role: 'WORKER',
            lastLoginAt: new Date(),
          },
        });
      }
    }

    return { user: { id: user.id, email: user.email, role: user.role, language: user.language } };
  }

  /**
   * Get current user profile from Prisma (used by GET /auth/me).
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        language: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        worker: { select: { id: true, name: true, employeeId: true, phone: true } },
        supervisor: { select: { id: true, name: true, phone: true, area: true } },
      },
    });

    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    return user;
  }
}
