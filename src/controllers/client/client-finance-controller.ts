import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
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
      message: MESSAGES.FINANCE.FETCH_SUCCESS,
      data: result,
    });
  }

  async requestWithdrawal(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const { amount, note } = req.body as { amount: number; note?: string };
    const result = await this._clientFinanceService.requestWithdrawal(clientId!, amount, note);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FINANCE.WITHDRAWAL_REQUEST_CREATED,
      data: result,
    });
  }

  async getWithdrawals(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const result = await this._clientFinanceService.getWithdrawalHistory(clientId!, page, limit);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FINANCE.HISTORY_FETCHED,
      data: result.items,
      total: result.total,
      page,
      limit,
    });
  }
}
