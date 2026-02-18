import { Request, Response, NextFunction } from 'express';
import { AlertService } from '../services/alert.service';

export class AlertController {
  private service = new AlertService();

  acknowledge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alert = await this.service.acknowledgeAlert(req.params.id, (req as any).user.id);
      res.json({ success: true, data: alert });
    } catch (e) { next(e); }
  };

  getRecent = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const alerts = await this.service.getRecent();
      res.json({ success: true, data: alerts });
    } catch (e) { next(e); }
  };
}
