import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IGetRatesController } from './interfaces/get-rates-controller.interface';
import { IGetRatesService } from '../../services/commonServices/interfaces/get-rates-service.interface';

@injectable()
export class GetRatesController implements IGetRatesController {
  private _getRatesService: IGetRatesService;
  constructor(@inject('IGetRatesService') getRatesService: IGetRatesService) {
    this._getRatesService = getRatesService;
  }

  async getRatesController(req: Request, res: Response): Promise<void> {
    const base = (req.query.base as string) || 'USD';
    const rates = await this._getRatesService.getRates(base);

    res.json({
      success: true,
      rates,
    });
  }
}
