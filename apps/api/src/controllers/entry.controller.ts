import { Request, Response, NextFunction } from 'express';
import { EntryService } from '../services/entry.service';
import { RiskEngineService } from '../services/risk-engine.service';

export class EntryController {
  private service = new EntryService();
  private riskEngine = new RiskEngineService();

  checkClearance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.riskEngine.canWorkerEnter(req.body.manholeId, req.body.workerId);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  };

  startEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await this.service.startEntry({
        ...req.body,
        geoVerified: req.body._geoVerified,
      });
      res.status(201).json({ success: true, data: entry });
    } catch (e) { next(e); }
  };

  confirmExit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await this.service.confirmExit(req.params.id);
      res.json({ success: true, data: entry });
    } catch (e) { next(e); }
  };

  getActive = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const entries = await this.service.getActiveEntries();
      res.json({ success: true, data: entries });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await this.service.getById(req.params.id);
      res.json({ success: true, data: entry });
    } catch (e) { next(e); }
  };

  getByWorker = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entries = await this.service.getByWorkerId(req.params.workerId);
      res.json({ success: true, data: entries });
    } catch (e) { next(e); }
  };
}
