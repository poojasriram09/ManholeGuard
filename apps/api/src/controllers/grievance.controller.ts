import { Request, Response, NextFunction } from 'express';
import { GrievanceService } from '../services/grievance.service';
import { ManholeService } from '../services/manhole.service';

export class GrievanceController {
  private service = new GrievanceService();
  private manholeService = new ManholeService();

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

  /** Public manhole heatmap data — no auth required */
  getPublicHeatmap = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manholeService.getHeatmapData();
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };

  /** Public grievance list — no auth required */
  getGrievances = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getAll({ status: req.query.status as string });
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };

  /** Update grievance status — auth required */
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.updateStatus(req.params.id, req.body.status, req.body.resolutionNotes);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };
}
