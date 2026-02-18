import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { maintenanceCreateSchema, maintenanceUpdateSchema } from '../validators';
import { MaintenanceController } from '../controllers/maintenance.controller';

const router = Router();
const controller = new MaintenanceController();

router.use(authenticate);
router.get('/', controller.getAll);
router.post('/', authorize('SUPERVISOR', 'ADMIN'), validate(maintenanceCreateSchema), controller.create);
router.put('/:id', authorize('SUPERVISOR', 'ADMIN'), validate(maintenanceUpdateSchema), controller.update);
router.post('/auto-schedule', authorize('ADMIN'), controller.autoSchedule);

export default router;
