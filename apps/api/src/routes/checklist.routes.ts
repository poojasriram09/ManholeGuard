import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checklistSchema, checklistOverrideSchema } from '../validators';
import { ChecklistController } from '../controllers/checklist.controller';

const router = Router();
const controller = new ChecklistController();

router.use(authenticate);
router.post('/', validate(checklistSchema), controller.create);
router.post('/:id/override', authorize('SUPERVISOR', 'ADMIN'), validate(checklistOverrideSchema), controller.override);
router.get('/entry/:entryLogId', controller.getByEntryLog);

export default router;
