import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sosTriggerSchema } from '../validators';
import { SOSController } from '../controllers/sos.controller';

const router = Router();
const controller = new SOSController();

router.use(authenticate);
router.post('/trigger', validate(sosTriggerSchema), controller.trigger);
router.post('/:id/resolve', authorize('SUPERVISOR', 'ADMIN'), controller.resolve);
router.get('/active', controller.getActive);

export default router;
