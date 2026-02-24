import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { grievanceCreateSchema } from '../validators';
import { GrievanceController } from '../controllers/grievance.controller';

const router = Router();
const controller = new GrievanceController();

// Public routes - no auth required
router.post('/grievance', validate(grievanceCreateSchema), controller.submit);
router.get('/grievance/:code', controller.track);
router.get('/heatmap', controller.getPublicHeatmap);
router.get('/grievances', controller.getGrievances);

// Protected routes - auth required (used by dashboard)
router.put('/grievances/:id/status', authenticate, controller.updateStatus);

export default router;
