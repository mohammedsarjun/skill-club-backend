import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { MESSAGES } from '../../contants/contants';
import { HttpStatus } from '../../enums/http-status.enum';
import { IFreelancerFinanceService } from '../../services/freelancerServices/interfaces/freelancer-finance-service.interface';

@injectable()
export class FreelancerFinanceController {
  private _freelancerFinanceService: IFreelancerFinanceService;

  constructor(
    @inject('IFreelancerFinanceService') freelancerFinanceService: IFreelancerFinanceService,
  ) {
    this._freelancerFinanceService = freelancerFinanceService;
  }

  async requestWithdrawal(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { amount, note } = req.body as { amount: number; note?: string };
    const result = await this._freelancerFinanceService.requestWithdrawal(
      freelancerId,
      amount,
      note,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FINANCE.WITHDRAWAL_REQUEST_CREATED,
      data: result,
    });
  }

  async getWithdrawals(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const status = (req.query.status as string) || undefined;
    const result = await this._freelancerFinanceService.getWithdrawalHistory(
      freelancerId,
      page,
      limit,
      status,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FINANCE.HISTORY_FETCHED,
      data: {
        items: result.items,
        total: result.total,
        page,
        limit,
        pages: result.pages,
      },
    });
  }

  async getWithdrawalDetail(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { withdrawalId } = req.params;
    const result = await this._freelancerFinanceService.getWithdrawalDetail(
      freelancerId,
      withdrawalId,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FINANCE.DETAIL_FETCHED,
      data: result,
    });
  }
}

export default FreelancerFinanceController;
