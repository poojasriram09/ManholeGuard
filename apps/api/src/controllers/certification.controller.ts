import { Request, Response, NextFunction } from 'express';
import { CertificationService } from '../services/certification.service';

export class CertificationController {
  private service = new CertificationService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const certifications = await this.service.getByWorker(req.query.workerId as string);
      res.json({ success: true, data: certifications });
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const certification = await this.service.create(req.body);
      res.status(201).json({ success: true, data: certification });
    } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id);
      res.json({ success: true, data: null });
    } catch (e) { next(e); }
  };
}
