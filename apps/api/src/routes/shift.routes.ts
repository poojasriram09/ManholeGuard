import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { shiftStartSchema } from '../validators';
import { ShiftController } from '../controllers/shift.controller';

const router = Router();
const controller = new ShiftController();

router.use(authenticate);
router.post('/start', validate(shiftStartSchema), controller.start);
router.post('/:id/end', controller.end);
router.get('/active', controller.getActive);
router.get('/fatigue/:workerId', controller.getFatigue);

export default router;
