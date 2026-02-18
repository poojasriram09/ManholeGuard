import { Request, Response, NextFunction } from 'express';
import { ShiftService } from '../services/shift.service';

export class ShiftController {
  private service = new ShiftService();

  start = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shift = await this.service.startShift(req.body.workerId);
      res.status(201).json({ success: true, data: shift });
    } catch (e) { next(e); }
  };

  end = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shift = await this.service.endShift(req.params.id);
      res.json({ success: true, data: shift });
    } catch (e) { next(e); }
  };

  getActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workerId = req.query.workerId as string || (req as any).user?.workerId;
      const shifts = await this.service.getActiveShift(workerId);
      res.json({ success: true, data: shifts });
    } catch (e) { next(e); }
  };

  getFatigue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fatigue = await this.service.getFatigueStatus(req.params.workerId);
      res.json({ success: true, data: fatigue });
    } catch (e) { next(e); }
  };
}
