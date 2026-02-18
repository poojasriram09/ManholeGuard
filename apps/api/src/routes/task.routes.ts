import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { taskCreateSchema, taskUpdateSchema } from '../validators';
import { TaskController } from '../controllers/task.controller';

const router = Router();
const controller = new TaskController();

router.use(authenticate);
router.use(authorize('SUPERVISOR', 'ADMIN'));
router.post('/', validate(taskCreateSchema), controller.create);
router.get('/', controller.getAll);
router.put('/:id', validate(taskUpdateSchema), controller.update);

export default router;
