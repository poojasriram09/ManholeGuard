import { Request, Response, NextFunction } from 'express';
import { GasMonitorService } from '../services/gas-monitor.service';

export class GasController {
  private service = new GasMonitorService();

  submitReading = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reading = await this.service.recordReading(req.body.manholeId, req.body);
      res.status(201).json({ success: true, data: reading });
    } catch (e) { next(e); }
  };

  submitManual = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reading = await this.service.recordReading(req.body.manholeId, { ...req.body, source: 'manual' });
      res.status(201).json({ success: true, data: reading });
    } catch (e) { next(e); }
  };

  getByManhole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const readings = await this.service.getReadings(req.params.id);
      res.json({ success: true, data: readings });
    } catch (e) { next(e); }
  };

  getAlerts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const alerts = await this.service.getDangerousReadings();
      res.json({ success: true, data: alerts });
    } catch (e) { next(e); }
  };
}
