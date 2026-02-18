import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AlertController } from '../controllers/alert.controller';

const router = Router();
const controller = new AlertController();

router.use(authenticate);
router.post('/:id/acknowledge', controller.acknowledge);
router.get('/recent', controller.getRecent);

export default router;
