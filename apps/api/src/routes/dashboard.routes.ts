import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const controller = new DashboardController();

router.use(authenticate);
router.use(authorize('SUPERVISOR', 'ADMIN'));
router.get('/stats', controller.getStats);

export default router;
