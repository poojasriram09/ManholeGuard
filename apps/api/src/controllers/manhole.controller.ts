import { Request, Response, NextFunction } from 'express';
import { ManholeService } from '../services/manhole.service';

export class ManholeController {
  private service = new ManholeService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const manholes = await this.service.getAll({ area: req.query.area as string, riskLevel: req.query.risk_level as string });
      res.json({ success: true, data: manholes });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const manhole = await this.service.getById(req.params.id);
      res.json({ success: true, data: manhole });
    } catch (e) { next(e); }
  };

  getHeatmap = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getHeatmapData();
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const manhole = await this.service.create(req.body);
      res.status(201).json({ success: true, data: manhole });
    } catch (e) { next(e); }
  };
}
