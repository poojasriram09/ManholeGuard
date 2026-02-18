import { Request, Response, NextFunction } from 'express';
import { GrievanceService } from '../services/grievance.service';

export class GrievanceController {
  private service = new GrievanceService();

  submit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const grievance = await this.service.create(req.body);
      res.status(201).json({ success: true, data: grievance });
    } catch (e) { next(e); }
  };

  track = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const grievance = await this.service.getByTrackingCode(req.params.code);
      res.json({ success: true, data: grievance });
    } catch (e) { next(e); }
  };

  getHeatmap = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAll();
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };
}
