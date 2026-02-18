import { Request, Response, NextFunction } from 'express';
import { IncidentService } from '../services/incident.service';

export class IncidentController {
  private service = new IncidentService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incidents = await this.service.getAll(req.query);
      res.json({ success: true, data: incidents });
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incident = await this.service.create(req.body);
      res.status(201).json({ success: true, data: incident });
    } catch (e) { next(e); }
  };

  resolve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const incident = await this.service.resolve(req.params.id, (req as any).user.id);
      res.json({ success: true, data: incident });
    } catch (e) { next(e); }
  };
}
