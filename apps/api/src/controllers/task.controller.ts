import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
  private service = new TaskService();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await this.service.create((req as any).user.id, req.body);
      res.status(201).json({ success: true, data: task });
    } catch (e) { next(e); }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await this.service.getAll(req.query);
      res.json({ success: true, data: tasks });
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await this.service.updateStatus(req.params.id, req.body.status);
      res.json({ success: true, data: task });
    } catch (e) { next(e); }
  };
}
