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

// Protected route
router.get('/heatmap', authenticate, controller.getHeatmap);

export default router;
