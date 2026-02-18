import { Router } from 'express';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);

export default router;
