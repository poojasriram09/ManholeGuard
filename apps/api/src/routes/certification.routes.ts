import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { certificationCreateSchema } from '../validators';
import { CertificationController } from '../controllers/certification.controller';

const router = Router();
const controller = new CertificationController();

router.use(authenticate);
router.get('/', controller.getAll);
router.post('/', authorize('ADMIN'), validate(certificationCreateSchema), controller.create);
router.delete('/:id', authorize('ADMIN'), controller.remove);

export default router;
