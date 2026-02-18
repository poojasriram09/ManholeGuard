import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { AuditController } from '../controllers/audit.controller';

const router = Router();
const controller = new AuditController();

router.use(authenticate);
router.use(authorize('ADMIN'));
router.get('/', controller.getAll);
router.get('/verify', controller.verify);

export default router;
