import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { entryStartSchema, entryClearanceSchema } from '../validators';
import { verifyGeoFence } from '../middleware/geoFence';
import { EntryController } from '../controllers/entry.controller';

const router = Router();
const controller = new EntryController();

router.use(authenticate);
router.post('/clearance', validate(entryClearanceSchema), controller.checkClearance);
router.post('/start', validate(entryStartSchema), verifyGeoFence, controller.startEntry);
router.post('/:id/exit', controller.confirmExit);
router.get('/active', controller.getActive);
router.get('/:id', controller.getById);
router.get('/worker/:workerId', controller.getByWorker);

export default router;
