import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';
import { IAdminWithdrawalController } from './interfaces/admin-withdrawal-controller.interface';
import { IAdminWithdrawalServices } from '../../services/adminServices/interfaces/admin-withdrawal-controller.interface';

@injectable()
export class AdminWithdrawalController implements IAdminWithdrawalController {
  private _adminWithdrawalService: IAdminWithdrawalServices;
  constructor(
    @inject('IAdminWithdrawalServices') adminWithdrawalService: IAdminWithdrawalServices,
  ) {
    this._adminWithdrawalService = adminWithdrawalService;
  }

  async getWithdrawStats(_req: Request, res: Response): Promise<void> {
    const result = await this._adminWithdrawalService.getWithdrawStats();
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.WITHDRAW.FETCH_STATS_SUCCESS,
      data: result,
    });
  }

  async getWithdrawals(_req: Request, res: Response): Promise<void> {
    const page = Number(_req.query.page || 1);
    const limit = Number(_req.query.limit || 10);
    const role = typeof _req.query.role === 'string' ? _req.query.role : undefined;
    const status = typeof _req.query.status === 'string' ? _req.query.status : undefined;

    const result = await this._adminWithdrawalService.getWithdrawals(page, limit, role, status);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.WITHDRAW.FETCH_SUCCESS,
      data: {
        items: result.items,
        total: result.total,
        page,
        limit,
      },
    });
  }

  async getWithdrawalDetail(_req: Request, res: Response): Promise<void> {
    const { withdrawalId } = _req.params;
    const result = await this._adminWithdrawalService.getWithdrawalDetail(withdrawalId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.WITHDRAW.FETCH_SUCCESS,
      data: result,
    });
  }

  async approveWithdrawal(_req: Request, res: Response): Promise<void> {
    const { withdrawalId } = _req.params;
    await this._adminWithdrawalService.approveWithdrawal(withdrawalId);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.WITHDRAW.APPROVED,
    });
  }

  async rejectWithdrawal(_req: Request, res: Response): Promise<void> {
    const { withdrawalId } = _req.params;
    const { reason } = _req.body;

    await this._adminWithdrawalService.rejectWithdrawal(withdrawalId, reason);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.WITHDRAW.REJECTED,
    });
  }
}
