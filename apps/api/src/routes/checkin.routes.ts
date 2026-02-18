import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkInResponseSchema } from '../validators';
import { CheckInController } from '../controllers/checkin.controller';

const router = Router();
const controller = new CheckInController();

router.use(authenticate);
router.post('/respond', validate(checkInResponseSchema), controller.respond);
router.get('/entry/:entryLogId', controller.getByEntryLog);

export default router;
