import { Router } from 'express';
import { validate } from '../middleware/validate';
import { registerSchema } from '../validators';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new AuthController();

// Admin-only: register new users (creates in Firebase + Prisma)
router.post('/register', authenticate, authorize('ADMIN'), validate(registerSchema), controller.register);

// After Firebase sign-in on frontend, sync/create Prisma user
// Does NOT use authenticate middleware (user may not exist in Prisma yet)
router.post('/sync', controller.sync);

// Get current user profile (requires authenticated user)
router.get('/me', authenticate, controller.me);

export default router;
