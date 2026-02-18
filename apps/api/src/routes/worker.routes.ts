import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { workerCreateSchema } from '../validators';
import { WorkerController } from '../controllers/worker.controller';

const router = Router();
const controller = new WorkerController();

router.use(authenticate);
router.get('/', authorize('ADMIN', 'SUPERVISOR'), controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize('ADMIN'), validate(workerCreateSchema), controller.create);

export default router;
