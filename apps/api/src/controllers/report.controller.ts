import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  private service = new ReportService();

  generate = async (_req: Request, res: Response, _next: NextFunction) => {
    res.json({ success: true });
  };

  getAll = async (_req: Request, res: Response, _next: NextFunction) => {
    res.json({ success: true });
  };
}
