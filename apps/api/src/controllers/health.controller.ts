import { Request, Response, NextFunction } from 'express';
import { HealthCheckService } from '../services/health-check.service';

export class HealthController {
  private service = new HealthCheckService();

  check = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.recordHealthCheck(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (e) { next(e); }
  };

  getByWorker = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const records = await this.service.getWorkerHealthTrend(req.params.workerId);
      res.json({ success: true, data: records });
    } catch (e) { next(e); }
  };
}
