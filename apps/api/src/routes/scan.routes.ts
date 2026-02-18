import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { scanSchema } from '../validators';
import { ScanController } from '../controllers/scan.controller';

const router = Router();
const controller = new ScanController();

router.use(authenticate);
router.post('/', validate(scanSchema), controller.scan);

export default router;
