import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { gasReadingSchema } from '../validators';
import { GasController } from '../controllers/gas.controller';

const router = Router();
const controller = new GasController();

router.use(authenticate);
router.post('/reading', validate(gasReadingSchema), controller.submitReading);
router.post('/manual', validate(gasReadingSchema), controller.submitManual);
router.get('/manhole/:id', controller.getByManhole);
router.get('/alerts', controller.getAlerts);

export default router;
