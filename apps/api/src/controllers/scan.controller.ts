import { Request, Response, NextFunction } from 'express';
import { ManholeService } from '../services/manhole.service';
import { RiskEngineService } from '../services/risk-engine.service';

export class ScanController {
  private manholeService = new ManholeService();
  private riskEngine = new RiskEngineService();

  scan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const manhole = await this.manholeService.getByQrCode(req.body.qrCodeId);
      const risk = await this.riskEngine.predictRisk(manhole.id);
      res.json({ success: true, data: { manhole, risk } });
    } catch (e) { next(e); }
  };
}
