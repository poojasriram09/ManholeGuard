import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { ReportController } from '../controllers/report.controller';

const router = Router();
const controller = new ReportController();

router.use(authenticate);
router.post('/generate', authorize('SUPERVISOR', 'ADMIN'), controller.generate);
router.get('/', controller.getAll);

export default router;
