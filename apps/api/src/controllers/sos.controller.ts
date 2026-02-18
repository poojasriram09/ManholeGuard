import { Request, Response, NextFunction } from 'express';
import { SOSService } from '../services/sos.service';

export class SOSController {
  private service = new SOSService();

  trigger = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sos = await this.service.triggerSOS(req.body);
      res.status(201).json({ success: true, data: sos });
    } catch (e) { next(e); }
  };

  resolve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sos = await this.service.resolveSOS(req.params.id, req.body.outcome);
      res.json({ success: true, data: sos });
    } catch (e) { next(e); }
  };

  getActive = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const alerts = await this.service.getActive();
      res.json({ success: true, data: alerts });
    } catch (e) { next(e); }
  };
}
