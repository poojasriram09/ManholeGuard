import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const controller = new AnalyticsController();

router.use(authenticate);
router.use(authorize('SUPERVISOR', 'ADMIN'));
router.get('/overview', controller.getOverview);
router.get('/workers', controller.getWorkers);

export default router;
