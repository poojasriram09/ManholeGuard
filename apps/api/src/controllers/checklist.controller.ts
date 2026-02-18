import { Request, Response, NextFunction } from 'express';
import { ChecklistService } from '../services/checklist.service';

export class ChecklistController {
  private service = new ChecklistService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const checklist = await this.service.createChecklist(req.body.entryLogId, req.body.items);
      res.status(201).json({ success: true, data: checklist });
    } catch (e) { next(e); }
  };

  override = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const checklist = await this.service.supervisorOverride(req.params.id, req.body.reason);
      res.json({ success: true, data: checklist });
    } catch (e) { next(e); }
  };

  getByEntryLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const checklist = await this.service.getByEntryLog(req.params.entryLogId);
      res.json({ success: true, data: checklist });
    } catch (e) { next(e); }
  };
}
