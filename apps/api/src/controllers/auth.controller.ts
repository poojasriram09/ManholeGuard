import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { firebaseAuth } from '../config/firebase-admin';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.register(req.body.email, req.body.password, req.body.role, req.body.language);
      res.status(201).json({ success: true, data: result });
    } catch (e) { next(e); }
  };

  /**
   * POST /auth/sync — called after Firebase signIn on the frontend.
   * The user may not exist in Prisma yet (first Google sign-in), so we verify the
   * Firebase token directly instead of going through the normal authenticate middleware.
   */
  sync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = await firebaseAuth.verifyIdToken(token);
      const result = await this.service.syncFirebaseUser(decoded.uid, decoded.email || '');
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getProfile(req.user!.id);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  };
}
