import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { incidentCreateSchema } from '../validators';
import { IncidentController } from '../controllers/incident.controller';

const router = Router();
const controller = new IncidentController();

router.use(authenticate);
router.get('/', controller.getAll);
router.post('/', validate(incidentCreateSchema), controller.create);
router.post('/:id/resolve', authorize('SUPERVISOR', 'ADMIN'), controller.resolve);

export default router;
