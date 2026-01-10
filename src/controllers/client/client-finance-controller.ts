import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IClientFinanceController } from './interfaces/client-finance-controller.interface';
import { IClientFinanceService } from '../../services/clientServices/interfaces/client-finance-service.interface';

@injectable()
export class ClientFinanceController implements IClientFinanceController {
  private _clientFinanceService: IClientFinanceService;

  constructor(@inject('IClientFinanceService') clientFinanceService: IClientFinanceService) {
    this._clientFinanceService = clientFinanceService;
  }

  async getFinanceData(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const result = await this._clientFinanceService.getFinanceData(clientId!);
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Finance data fetched successfully',
      data: result,
    });
  }
}
