import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

export class AuditController {
  private service = new AuditService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await this.service.getAll(req.query);
      res.json({ success: true, data: logs });
    } catch (e) { next(e); }
  };

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.verifyIntegrity();
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  };
}
