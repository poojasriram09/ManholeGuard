import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { manholeCreateSchema } from '../validators';
import { ManholeController } from '../controllers/manhole.controller';

const router = Router();
const controller = new ManholeController();

router.use(authenticate);
router.get('/', controller.getAll);
router.get('/heatmap', controller.getHeatmap);
router.get('/:id', controller.getById);
router.post('/', authorize('ADMIN'), validate(manholeCreateSchema), controller.create);

export default router;
