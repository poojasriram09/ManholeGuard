import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { syncPushSchema } from '../validators';
import { SyncController } from '../controllers/sync.controller';

const router = Router();
const controller = new SyncController();

router.use(authenticate);
router.post('/push', validate(syncPushSchema), controller.push);
router.get('/pending/:deviceId', controller.getPending);

export default router;
