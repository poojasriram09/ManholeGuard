import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private service = new DashboardService();

  getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getStats();
      res.json({ success: true, data: stats });
    } catch (e) { next(e); }
  };
}
