import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  private service = new AnalyticsService();

  getOverview = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getOverviewStats();
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };

  getWorkers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getWorkerPerformance();
      res.json({ success: true, data });
    } catch (e) { next(e); }
  };
}
