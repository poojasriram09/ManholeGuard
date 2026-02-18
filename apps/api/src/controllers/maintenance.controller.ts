import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/maintenance.service';

export class MaintenanceController {
  private service = new MaintenanceService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const records = await this.service.getAll(req.query);
      res.json({ success: true, data: records });
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await this.service.create(req.body);
      res.status(201).json({ success: true, data: record });
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const record = await this.service.updateStatus(req.params.id, req.body.status, req.body.notes);
      res.json({ success: true, data: record });
    } catch (e) { next(e); }
  };

  autoSchedule = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.autoSchedule();
      res.status(201).json({ success: true, data: result });
    } catch (e) { next(e); }
  };
}
