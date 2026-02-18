import { Request, Response, NextFunction } from 'express';
import { WorkerService } from '../services/worker.service';

export class WorkerController {
  private service = new WorkerService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workers = await this.service.getAll({ supervisorId: req.query.supervisor_id as string });
      res.json({ success: true, data: workers });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const worker = await this.service.getById(req.params.id);
      res.json({ success: true, data: worker });
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const worker = await this.service.create(req.body);
      res.status(201).json({ success: true, data: worker });
    } catch (e) { next(e); }
  };
}
