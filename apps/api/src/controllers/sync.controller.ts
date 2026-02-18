import { Request, Response, NextFunction } from 'express';
import { SyncService } from '../services/sync.service';

export class SyncController {
  private service = new SyncService();

  push = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.pushActions(req.body.deviceId, req.body.actions);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  };

  getPending = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pending = await this.service.getPending(req.params.deviceId);
      res.json({ success: true, data: pending });
    } catch (e) { next(e); }
  };
}
