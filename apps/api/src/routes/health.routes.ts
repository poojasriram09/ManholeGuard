import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { healthCheckSchema } from '../validators';
import { HealthController } from '../controllers/health.controller';

const router = Router();
const controller = new HealthController();

router.use(authenticate);
router.post('/check', validate(healthCheckSchema), controller.check);
router.get('/worker/:workerId', controller.getByWorker);

export default router;
