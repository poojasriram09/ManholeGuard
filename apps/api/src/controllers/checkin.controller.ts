import { Request, Response, NextFunction } from 'express';
import { CheckInService } from '../services/checkin.service';

export class CheckInController {
  private service = new CheckInService();

  respond = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const checkin = await this.service.respondToCheckIn(req.body.checkInId, req.body.method);
      res.json({ success: true, data: checkin });
    } catch (e) { next(e); }
  };

  getByEntryLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const checkins = await this.service.getCheckInsByEntry(req.params.entryLogId);
      res.json({ success: true, data: checkins });
    } catch (e) { next(e); }
  };
}
