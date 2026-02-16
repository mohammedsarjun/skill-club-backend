import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { MESSAGES } from '../../contants/contants';
import { HttpStatus } from '../../enums/http-status.enum';
import { IFreelancerEarningsController } from './interfaces/freelancer-earnings-controller.interface';
import { IFreelancerEarningsService } from '../../services/freelancerServices/interfaces/freelancer-earnings-service.interface';
import { FreelancerTransactionsQueryDTO } from '../../dto/freelancerDTO/freelancer-earnings.dto';

@injectable()
export class FreelancerEarningsController implements IFreelancerEarningsController {
  private _freelancerEarningsService: IFreelancerEarningsService;

  constructor(
    @inject('IFreelancerEarningsService') freelancerEarningsService: IFreelancerEarningsService,
  ) {
    this._freelancerEarningsService = freelancerEarningsService;
  }

  async getEarningsOverview(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const result = await this._freelancerEarningsService.getEarningsOverview(freelancerId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.EARNINGS.OVERVIEW_FETCHED,
      data: result,
    });
  }

  async getTransactions(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { page, limit, period, startDate, endDate } = req.query as Record<
      string,
      string | undefined
    >;

    const allowedPeriods: Array<'week' | 'month' | 'year'> = ['week', 'month', 'year'];
    const parsedPeriod =
      period && allowedPeriods.includes(period as 'week' | 'month' | 'year')
        ? (period as 'week' | 'month' | 'year')
        : undefined;

    const query: FreelancerTransactionsQueryDTO = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      filters: {
        period: parsedPeriod,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    };

    const result = await this._freelancerEarningsService.getTransactions(freelancerId, query);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.EARNINGS.TRANSACTIONS_FETCHED,
      data: result,
    });
  }
}
