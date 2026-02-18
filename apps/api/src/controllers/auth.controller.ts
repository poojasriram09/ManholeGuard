import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.register(req.body.email, req.body.password, req.body.role, req.body.language);
      res.status(201).json({ success: true, data: result });
    } catch (e) { next(e); }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.login(req.body.email, req.body.password);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  };
}
